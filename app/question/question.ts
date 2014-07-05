/// <reference path="../../__all.d.ts" />
import model=require('app/model');

module question {

    'use strict';

    export interface IQuestionListener {
        answerClicked(question:model.QuestionVM): void;
        tagQuestion(tag: string, q: model.QuestionVM): void;
    }

    export class QuestionDirective implements ng.IDirective {
        templateUrl = "app/question/question.html";
        restrict = 'E';

        scope = {
            question : '=',
            mode: "@mode",
            listener: '='
        }

        link ($scope: QuestionScope, element: JQuery, attrs: ng.IAttributes) {
            //setting up the scope.
            $scope.answerClicked = (ans:model.AnswerVM, question:model.QuestionVM)=>{
                question.answerClicked(ans);
                if ($scope.listener){
                    var callback = $scope.listener;
                    callback.answerClicked(question);
                }
            };
            $scope.explain_collapse = true;
            $scope.toggle_explain = ()=>{
                $scope.explain_collapse = !$scope.explain_collapse;
            }

            $scope.tagQuestion = (tag: string, question: model.QuestionVM)=>{
                if ($scope.listener){
                    var callback = $scope.listener;
                    callback.tagQuestion(tag, question);
                }
            }
        }
    }

    export function directive () : ng.IDirective {
        return new QuestionDirective();
    }

    export interface QuestionScope extends ng.IScope{
        explain_collapse: boolean;
        question: model.QuestionVM;
        answerClicked: (ans:model.AnswerVM, question:model.QuestionVM)=>void;
        tagQuestion : (tag: string, question: model.QuestionVM)=>void;
        toggle_explain: ()=>void;
        listener: IQuestionListener;
    }
}

export=question;