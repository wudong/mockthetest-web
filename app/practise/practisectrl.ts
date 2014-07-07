/// <reference path="../../__all.d.ts" />

import bootstrap = ng.ui.bootstrap;

import service=require('app/service');
import model=require('app/model');
import question=require('app/question/question');
import browse=require('app/practise/browsectrl');
import base=require('app/practise/commonctrl');


module practise {

    export class PractiseController {
        scope:IPractiseScope;
        logger:ng.ILogService;
        testService:service.TestService;
        intervalService:ng.IIntervalService;
        timeoutService:ng.ITimeoutService;
        locationService: ng.ILocationService;
        routeParams: any;
        mode : model.MODE;
        base: base.CommonControl;

        indexLabelMap : any= {
            0 : 'A', 1 : 'B', 2: 'C', 3: 'D', 4: 'E', 5: 'F'
        };

        //tracking the previous number key.
        _num_key_previous: number = 0;

        //record the mode that is before entering review mode.
        pre_mode : model.MODE;

        public static $inject = [
            '$scope', '$log', 'testService', '$interval', '$timeout','$location', '$routeParams',
            'promiseTracker', '$q', 'mode'
        ];

        constructor($scope:IPractiseScope, $log:ng.ILogService, testSrv:service.TestService,
                    $interval:ng.IIntervalService, $timeout:ng.ITimeoutService,
                    $location: ng.ILocationService, $routeParams: ng.route.IRouteParamsService,
                    promiseTracker: ng.promisetracker.IPromiseTrackerService, $q: ng.IQService,
                    mode: model.MODE) {
            this.scope = $scope;
            this.testService = testSrv;
            this.scope.vm = this;
            this.scope.questions = [];
            this.logger = $log;
            this.intervalService = $interval;
            this.timeoutService = $timeout;

            this.locationService = $location;
            this.routeParams = $routeParams;
            this.scope.loadPromiseTracker = promiseTracker();

            this.base = new base.CommonControl($log, testSrv, $location, $q, $interval);

            //this.promiseTracker = promiseTracker;
            this.mode = mode;

            this.setupQuestions();

        }

        public questionListener : question.IQuestionListener ={
            answerClicked : (question:model.QuestionVM)=>{
                var iQuestionScore = this.base.calculateScore(this.scope.questions);
                this.scope.score = iQuestionScore;
                this.base.answerIsGiven(question);
            },

            tagQuestion: (tag: string, question: model.QuestionVM)=>{
                this.base.tagQuestion(tag, question);
            }
        }

        private focus_for_key(){
            $('#practise-main-body').focus();
        }

        private setupQuestions(){
            this.logger.debug("To preparing questions for display");
            this.resetScope();

            this.displayQuestionsByRetraval(()=>{
                var allQuestionVMs = this.testService.getAllQuestionVMs(true);
                if (allQuestionVMs===null)return null;

                var number = (allQuestionVMs.length >= model.Constance.Number_Of_Question)?
                    model.Constance.Number_Of_Question: allQuestionVMs.length;

                if (number >= 0) {
                    return _.chain(allQuestionVMs).last(number).shuffle().value();
                }
            });
         }

        public setMode(m: model.MODE){
            if (this.mode === m)return;
            else{
                this.pre_mode = this.mode;
                this.mode= m;
            }
        }

        public getModeString():string {
            return model.MODE[this.mode];
        }

        public inTestMode(){return this.mode===model.MODE.test}
        public inPractiseMode(){return this.mode===model.MODE.practise}
        public inReviewMode(){return this.mode===model.MODE.review}

        /**
         * This is the main entry to get the question needed to display
         * on the page.
         * @param retrival
         */
        private displayQuestionsByRetraval(retrival: ()=>model.QuestionVM[] ) {

            var then = this.base.displayQuestionsByRetraval(retrival, (qs:model.QuestionVM[])=> {

                this.logger.debug("Loading question for display success, question number: " + qs.length);

                this.scope.questions = qs;
                this.scope.totalQuestions = qs.length;

                _(this.scope.questions).each((q: model.QuestionVM)=> {
                    q.reset();

                    //rest the selection from the questions.
                    _(q.answers).each((aa: model.AnswerVM)=>{
                        aa.selected=false;
                    });
                });

                this.setQuestionToDisplay(0, true);
            });

            this.scope.loadPromiseTracker.addPromise(then);
        }



        public navigateTo(index:number) {
            this.setQuestionToDisplay(index);
        }

        private setQuestionToDisplay(index:number, force?:boolean):void {
            if (index < 0 || index >=this.scope.questions.length){
                this.logger.debug("index out of range " + index);
                return;
            }

            if ((this.scope.questionIndex !== index) || force) {
                //mark current question.
                var qvm = <model.QuestionVM> this.scope.questions[index];

                qvm.current = true;
                if (this.scope.question != null) {
                    this.scope.question.current = false;
                }

                this.scope.question = qvm;
                this.scope.questionIndex = index;
                //can only do it here because it is a function from the bootstrap.
                this.scope.explain_collapse=true;
            }
        }

        public previous() {
            if (this.scope.questionIndex > 0)
                this.setQuestionToDisplay(this.scope.questionIndex - 1);

        }

        public isLogin():boolean {
            return this.testService.isLogin();
        }

        public submitMark() {
            this.base.submitMark();
        }

        public next() {
            if (this.scope.questionIndex < this.scope.questions.length - 1) {
                this.setQuestionToDisplay(this.scope.questionIndex + 1);
            }else if (this.scope.questionIndex === this.scope.questions.length-1 ){//last one
                if (this.indexLabelMap) this.reportResult();
            }
        }

        public reportResult(){

        }

        public flag(q:model.QuestionVM) {
            this.base.flag(q);
        }

        public edit(q:model.QuestionVM) {
            this.base.edit(q);
        }

        //record the
        public report(q: model.QuestionVM, type: string){
            this.base.report(q, type);
        }

        public toggle_display(name: string){
            var prop = name + "_collapse";
            this.scope[prop] = !this.scope[prop];
        }

        public key_pressed(event: any){
           // this.logger.debug("key pressed with charCode: " + event.keyCode);
            if (!this.scope.question) return;

            if (event.keyCode === 74 || event.keyCode === 37){ //j <-
                 this.previous();
            }else if (event.keyCode === 75 || event.keyCode === 39){ //k ->
                 this.next();
            }else if (event.keyCode === 82){ //r
                //this.review_practise()
            }else if (event.keyCode === 72){ //h
                this.toggle_display('help');
            }else if (event.keyCode === 69){ //e
                this.edit(this.scope.question);
            }else if (event.keyCode === 77){ //m
                this.flag(this.scope.question);
            }

//            else if (event.keyCode >=48 && event.keyCode <=57){//0, 9
//                if (this._num_key_previous===0){
//                    this._num_key_previous = event.keyCode;
//                    this.timeoutService( ()=>{
//                        //timeout but still no second key pressed. t
//                        if (this._num_key_previous!==0){
//                            //it is not yet clear by the second key press.
//                            var first = this._num_key_previous - 48;
//                            this._num_key_previous = 0;
//                            this.setQuestionToDisplay(first-1)
//                        }
//                    }, 300);
//                }else{
//                    var first = this._num_key_previous - 48;
//                    this._num_key_previous = 0;
//                    var second = event.keyCode - 48
//                    var qi = first*10 + second;
//                    this.setQuestionToDisplay(qi-1);
//                }
//            }
        }

        //finishing the review and reset to another one.
        public finish_review(){
            if (this.mode!==model.MODE.review)return;
            else{
                this.setMode(this.pre_mode);
                this.resetQuestions();
            }
        }

        /**
         * Review the ones that is answered wrong in a test.
         */
        public review_the_test() {
            //find out the ones that is not success.
           var qs= _(this.scope.questions).filter((q: model.QuestionVM)=>{
               return (q.success)!==true;
            });

            if (qs.length===0){
                this.testService.displayMessage("Nothing to review, all question has been answered correctly!", 'info')
                return ;
            }

            this.doing_review_with_question(qs);
        }

        private doing_review_with_question(qs: model.QuestionVM[]){

            this.setMode(model.MODE.review);

            this.resetScope();

            this.scope.questions = qs;
            this.scope.totalQuestions = qs.length;

            this.setQuestionToDisplay(0);
        }

        /**
         * Review the questions that either marked or done wrong in this session.
         *
         */
        public review_practise(){
            var qs = this.testService.getQuestionsForReview();

            if (qs.length===0){
                //nothing to review.
                this.testService.displayMessage("Nothing to review, all question has been answered correctly!", "info")
                return;
            }

            this.doing_review_with_question(qs);
        }

        public allAnswered():boolean {
            return this.scope.score.allAnswered();
        }

        public getAnsweredPercentage():number {
            if (this.inTestMode()) {
                return 100 * (this.scope.score.answeredQuestions / this.scope.score.totalQuestions);
            } else {
                return 100 * (this.scope.score.answeredQuestions - this.scope.score.correctlyAnsweredQuestions) / this.scope.score.totalQuestions;
            }
        }

        public resetQuestions() {
            if (this.isLogin()) {
                this.testService.sendingMark((n:number)=> {
                    if (n > 0) {
                        this.testService.displayMessage(n + " questions submitted", "info");
                    }
                    this.reset();
                });
            }else{
                this.reset();
            }
        }

        private reset(){
            if (this.locationService.search() && this.locationService.search().st) {
                this.locationService.search('st', null);
            }else{
                this.scope.questions = [];
                this.resetScope();
                this.setupQuestions();
            }
        }

        //reset the scope to its initial state.
        private resetScope() {
            this.scope.score=new base.IQuestionScore();
            //total seconds in 40 mins
            this.scope.countdown = 40 * 60;

            this.scope.explain_collapse=true;
            this.scope.search_collapse=true;

        }
    }

    /**
     * The View Model object
     */
    export interface IPractiseScope extends ng.IScope {
        vm: PractiseController;
        questions: model.QuestionVM[];
        question: model.QuestionVM;
        questionIndex: number;

        totalQuestions: number;

        score: base.IQuestionScore;

        explain_collapse : boolean;
        help_collapse: boolean;
        search_collapse: boolean;

        countdown: number;
        loadPromiseTracker: ng.promisetracker.IPromiseTracker;
    }

}
export=practise;