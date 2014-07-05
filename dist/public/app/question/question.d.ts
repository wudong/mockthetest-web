/// <reference path="../../__all.d.ts" />
import model = require('app/model');
declare module question {
    interface IQuestionListener {
        answerClicked(question: model.QuestionVM): void;
        tagQuestion(tag: string, q: model.QuestionVM): void;
    }
    class QuestionDirective implements ng.IDirective {
        public templateUrl: string;
        public restrict: string;
        public scope: {
            question: string;
            mode: string;
            listener: string;
        };
        public link($scope: QuestionScope, element: JQuery, attrs: ng.IAttributes): void;
    }
    function directive(): ng.IDirective;
    interface QuestionScope extends ng.IScope {
        explain_collapse: boolean;
        question: model.QuestionVM;
        answerClicked: (ans: model.AnswerVM, question: model.QuestionVM) => void;
        tagQuestion: (tag: string, question: model.QuestionVM) => void;
        toggle_explain: () => void;
        listener: IQuestionListener;
    }
}
export = question;
