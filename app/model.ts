/// <reference path="../__all.d.ts" />

module model {
    'use strict';

    export class ModelClass {
        _id:string;
    }

    var all_tags : string[] =null;
    function getAllTags(){
        if (!all_tags){
            var all_tags: string[] = [];
            for(var n in Tag) {
                if(typeof Tag[n] === 'number') all_tags.push(n);
            }
        }
        return all_tags;
    }

    export class Constance {
        static Number_Of_Question:number = 24;
        static Passing_Rate:number = 0.75;
        static EventType_EditQuestion:string = 'EType_edit_question';
        //static COOKIE_KEY_USER_ID = 'user_id';
        //static LS_KEY_USER_NAME = 'user_name';
    }

    export enum MODE {
        practise,
        test,
        review
    }

    export enum Tag {
        history,
        culture,
        government,
        society,
        law,
        'real-test'
    }

    /**
     * The type of the user's report for question need improvement.
     */
    export enum ReportType{
        duplicate,
        wrong,
        format
    }

    export enum QuestionType{
        yes_or_no,
        right_or_wrong,
        single,
        multi
    }

    export class Question extends ModelClass {
        question:string;
        type:string;
        explanation:string;
        difficulty:number;
        category:string;
        answers:Answer[] = [];
        answer: boolean;
        //mark whether this question has been deleted.
        deleted: boolean;
        tags: string[] = [];

        //the mark for the question for the current user.
        //mark:Mark;
    }

    export class Answer {
        text:string;
        right:boolean
    }

    export class Mark extends ModelClass {
        question_id:string;
        user_id:string;
        last_update:Date = null;
        //whether it is flagged.
        flag: boolean= false;

        //how many time for each mark type.
        private answered_right:MarkRecord;
        private answered_wrong:MarkRecord;

        public updateFrom(m: Mark){
            this.question_id = m.question_id;
            this.user_id = m.user_id;
            this.last_update = _.isString(m.last_update)? (new Date(<any>m.last_update)): m.last_update;
            this.flag = m.flag;
            if (m.answered_right) {
                this.answered_right = _.clone(m.answered_right);
                this.answered_right.last_update = _.isString(m.answered_right.last_update)? (new Date(<any>m.answered_right.last_update)): m.answered_right.last_update;
                this.answered_right.previous_update = _.isString(m.answered_right.previous_update)? (new Date(<any>m.answered_right.previous_update)): m.answered_right.previous_update;
            }
            if (m.answered_wrong) {
                this.answered_wrong = _.clone(m.answered_wrong);
                this.answered_wrong.last_update = _.isString(m.answered_wrong.last_update)? (new Date(<any>m.answered_wrong.last_update)): m.answered_wrong.last_update;
                this.answered_wrong.previous_update = _.isString(m.answered_wrong.previous_update)? (new Date(<any>m.answered_wrong.previous_update)): m.answered_wrong.previous_update;
            }
        }

        public beenAnsweredWrong(){
            return (this.answered_wrong) && this.answered_wrong.repeat > 0;
        }

        //
        public lastMarkedRight(){
            if (this.answered_right){
                return (!this.answered_wrong || (this.answered_right.last_update > this.answered_wrong.last_update));
            }
            return false;
        }

        public lastMarkedWrong(){
            if (this.answered_wrong){
                return (!this.answered_right || (this.answered_wrong.last_update > this.answered_right.last_update));
            }
            return false;
        }


        /**
         * Document the logic here. maybe need some test as well.
         * Doesn't look very clean.
         *
         * @param prop
         * @param prop_oppo
         * @param sessionStart
         * @private
         */
        private _do_mark(prop: string, prop_oppo: string, sessionStart: Date){
            if (!this[prop] || this[prop].last_update < sessionStart){
                if (!this[prop])
                    this[prop] =new MarkRecord();

                this[prop].increase();
                this.last_update = this[prop].last_update;
                //handle opposite.
                if (this[prop_oppo] && this[prop_oppo].last_update > sessionStart){
                    this[prop_oppo].restore();
                    if (this[prop_oppo].repeat===0)
                        this[prop_oppo]=null;
                }
            }
        }

        public doFlag(f: boolean ){
            if (f===this.flag) return;
            else{
                this.flag= f;
                this.last_update = new Date();
            }
        }

        //not double count.
        //only update once within one session.
        public right(sessionStart: Date){
           this._do_mark('answered_right', 'answered_wrong', sessionStart);
        }

        public wrong(sessionStart: Date){
            this._do_mark('answered_wrong', 'answered_right', sessionStart);
        }

        //answered wrong more than once.
        public isDifficult(): boolean{
            return (this.answered_wrong) && this.answered_wrong.repeat > 2
               && (!this.answered_right || this.answered_right.repeat <=this.answered_wrong.repeat);
        }

        public score(): number{
            var weight_for_no_mark = 9;
            var weight_for_mark_right = -1;
            var weight_for_mark_wrong = 3;

            if (this.last_update===null)return weight_for_no_mark;

            else {
                var score = 0;

                if (this.answered_right) {
                    score += weight_for_mark_right * this.answered_right.repeat;
                }
                if (this.answered_wrong) {
                    score += weight_for_mark_wrong * this.answered_wrong.repeat;
                }
                return score;
            }
        }
    }

    export class MarkRecord {
        repeat:number;
        last_update:Date;
        previous_update: Date;

        constructor() {
            this.repeat = 0;
        }

        public increase() {
            this.repeat++;
            this.previous_update = this.last_update;
            this.last_update = new Date();
        }

        public restore() {
            if (this.repeat > 0){
                this.repeat--;
                this.last_update = this.previous_update;
            }
        }
    }

    export class User extends ModelClass {
        username:string;
        _id:string;
    }

    export class TagVM{
        tag: string;
        selected: boolean;
    }

    //viewer objects that is used in the client viewer.
    export class QuestionVM {

        question : model.Question;
        answers: AnswerVM[] = [];
        tags: TagVM[] =[];
        //additional text when the question's test is null.
        questionText: string;

        constructor(q: model.Question){
            this.question = q;
            _(this.question.answers).each((a)=>{
                this.answers.push(new AnswerVM(a));
            })

            var alltags = getAllTags();
            _(alltags).each((s:string)=>{
                var tagVM = new TagVM();
                tagVM.tag = s;
                tagVM.selected = (q.tags && q.tags.indexOf(s) >=0);
                this.tags.push(tagVM);
            })
        }

        //additional UI properties.
        success: boolean;
        not_success:boolean;


        flagged: boolean;
        //to indicate the current question been viewed.
        current: boolean;
        explained: boolean;

        //whether this question has been answered in the session;
        answered: boolean;
        //whether this question should be reviewed.
        to_review: boolean;

        public questionAnsweredCorrectly():boolean {
            return _(this.answers).every((a:model.AnswerVM)=> {
                return (a.selected && a.answer.right) || (!a.answer.right && !a.selected);
            });
        }


        //reset the viewer object to be displayed again.
        public reset() {
            delete this.success
            delete this.not_success
            delete this.current
            delete this.explained

            //rest the selection from the questions.
            _(this.answers).each((aa: model.AnswerVM)=>{
                aa.selected=false;
            });
        }

        public answerClicked = (ans: AnswerVM)=>{
            //if clicked on an selected one, don't do anything.
            var countBy : number = 0;

            _(this.answers).each((a)=>{
               if (a.selected) countBy++;
            });

            if (this.question.type !== 'multi') {
                if (ans.selected===true)return;
                else{
                    ans.selected = true;
                    this.answers.forEach((a:model.AnswerVM)=> {
                        if (a !== ans) {
                            a.selected = false;
                        }
                    });
                }
            } else if (this.question.type === 'multi') {
                if (countBy <2) {
                    ans.selected = !ans.selected;
                    if (ans.selected){
                        countBy+=1;
                    }else{
                        countBy-=1;
                    }
                }else if (countBy===2){
                    if (ans.selected) {
                        ans.selected = false;
                        countBy -= 1;
                    }
                }
            }

            //multi selection. or not.
            if (this.question.type !== 'multi' || ((countBy)===2)){
                this.answered = true;
                if (this.questionAnsweredCorrectly()) {
                    this.success = true;
                    this.not_success = false;
                    this.to_review=false;
                } else {
                    this.not_success = true;
                    this.success = false;
                    this.to_review=true;
                }
            }
        }
    }

    export class AnswerVM {
        answer: model.Answer;

        constructor(a: model.Answer){
            this.answer = a;
        }

        selected: boolean;
    }

    export class SessionInfo{
        session_start: Date;
        session_time: number;
        session_question_total: number;
        session_question_answered: number;
        session_question_to_review: number;
        session_question_flagged: number;
        session_question_right: number;
        session_question_wrong: number;
        right_percent: number;
        session_question_flagged_no_answer: number;
    }

    export class UserProgress{
        total_time: number;

        total_questions: number;
        total_practised: number;
        total_right: number;
        total_wrong: number;
        total_been_wrong: number;
        total_difficult: number;
        total_flag: number;
        total_remain: number;
        all_to_review: number;

        right_percent: number;
        wrong_percent: number;
        all_percent: number;
    }

}
export=model;
