/// <reference path="../../__all.d.ts" />
import service = require('app/service');
import model = require('app/model');
declare module practise {
    class IQuestionScore {
        public totalQuestions: number;
        public correctlyAnsweredQuestions: number;
        public answeredQuestions: number;
        public passed: boolean;
        public allAnswered(): boolean;
    }
    class CommonControl {
        public logger: ng.ILogService;
        public testService: service.TestService;
        public modal: ng.ui.bootstrap.IModalService;
        public locationService: ng.ILocationService;
        public q: ng.IQService;
        public interval: ng.IIntervalService;
        constructor($log: ng.ILogService, testSrv: service.TestService, $modal: ng.ui.bootstrap.IModalService, $location: ng.ILocationService, $q: ng.IQService, $interval: ng.IIntervalService);
        public tagQuestion(tag: string, question: model.QuestionVM): void;
        public updateQuestions(): void;
        public retrieveQuestionForDisplay(retrival: () => model.QuestionVM[]): ng.IPromise<model.QuestionVM[]>;
        public calculateScore(qs: model.QuestionVM[]): IQuestionScore;
        public reportResult(qs: model.QuestionVM[]): void;
        public submitMark(): void;
        public flag(q: model.QuestionVM): void;
        public answerIsGiven(q: model.QuestionVM): void;
        public edit(q: model.QuestionVM): any;
        public displayQuestionsByRetraval(retrival: () => model.QuestionVM[], callback: (qs: model.QuestionVM[]) => void): ng.IPromise<void>;
        public report(q: model.QuestionVM, type: string): void;
        public save(q: model.QuestionVM): void;
        public create(q: model.Question): void;
        public delete(q: model.QuestionVM): void;
    }
}
export = practise;
