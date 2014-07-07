/// <reference path="../../__all.d.ts" />

import service = require ('app/service');
import model = require ('app/model');


module question {
    export class QuestionEditController {
        scope:IQuestionEditScope;
        questionVM: model.QuestionVM;

        public static $inject = [
            '$scope', 'question'
        ];

        constructor($scope:IQuestionEditScope,
                    question: model.QuestionVM

            ) {
            this.scope = $scope;
            this.scope.vm = this;
            this.scope.question = question.question;
            this.questionVM = question;
            this.scope.form = {new_answer_text: "", new_answer_right: false, newQuestion: false};
        }


        public create(){
            this.scope.form.newQuestion=true;
            var qq = new model.Question();
            qq.type='single';

            this.scope.question = qq;
            this.questionVM=null;
        }

        public addAnswer(){
            var a = new model.Answer();
            a.right = this.scope.form.new_answer_right;
            a.text = this.scope.form.new_answer_text;
            //add both to the question and the questionVM.
            this.scope.question.answers.push(a);

            if (this.questionVM!==null){
                this.questionVM.answers.push(new model.AnswerVM(a));
            }

            this.scope.form.new_answer_text="";
            this.scope.form.new_answer_right=false;
        }

        //edit the tag.s
        public tagClicked(){
        }

        /**
         * Need to remove answer both from the question and questionVM.
         * @param a
         */
        public removeAnswer(a: model.Answer){
            this.scope.question.answers
                = _(this.scope.question.answers).without(a);

            if (this.questionVM!==null){
                var toRemove =_(this.questionVM.answers).find(function(aa){
                    return aa.answer === a;
                })

                if (toRemove){
                    this.questionVM.answers = _(this.questionVM.answers).without(toRemove);
                }
            }
        }
    }

    export interface IQuestionEditScope extends ng.IScope {
        form: ControlModel;
        question: model.Question;
        vm: QuestionEditController;
    }

    export interface ControlModel {
        new_answer_text: string
        new_answer_right: boolean;
        newQuestion: boolean;
    }
}
export=question;
