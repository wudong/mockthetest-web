/// <reference path="../../__all.d.ts" />
import model = require('app/model');
declare module question {
    class QuestionEditController {
        public scope: IQuestionEditScope;
        public modal: ng.ui.bootstrap.IModalServiceInstance;
        public questionVM: model.QuestionVM;
        static $inject: string[];
        constructor($scope: IQuestionEditScope, $modalInstance: ng.ui.bootstrap.IModalServiceInstance, question: model.QuestionVM);
        public save(): void;
        public delete(): void;
        public cancel(): void;
        public create(): void;
        public addAnswer(): void;
        public tagClicked(): void;
        public removeAnswer(a: model.Answer): void;
    }
    interface IQuestionEditScope extends ng.IScope {
        form: ControlModel;
        question: model.Question;
        vm: QuestionEditController;
    }
    interface ControlModel {
        new_answer_text: string;
        new_answer_right: boolean;
        newQuestion: boolean;
    }
}
export = question;
