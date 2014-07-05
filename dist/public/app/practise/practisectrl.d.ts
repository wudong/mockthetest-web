/// <reference path="../../__all.d.ts" />
import service = require('app/service');
import model = require('app/model');
import question = require('app/question/question');
import base = require('app/practise/commonctrl');
declare module practise {
    class PractiseController {
        public scope: IPractiseScope;
        public logger: ng.ILogService;
        public testService: service.TestService;
        public intervalService: ng.IIntervalService;
        public timeoutService: ng.ITimeoutService;
        public modal: ng.ui.bootstrap.IModalService;
        public locationService: ng.ILocationService;
        public routeParams: any;
        public mode: model.MODE;
        public base: base.CommonControl;
        public indexLabelMap: any;
        public _num_key_previous: number;
        public pre_mode: model.MODE;
        static $inject: string[];
        constructor($scope: IPractiseScope, $log: ng.ILogService, testSrv: service.TestService, $interval: ng.IIntervalService, $timeout: ng.ITimeoutService, $modal: ng.ui.bootstrap.IModalService, $location: ng.ILocationService, $routeParams: ng.route.IRouteParamsService, promiseTracker: ng.promisetracker.IPromiseTrackerService, $q: ng.IQService, mode: model.MODE);
        public questionListener: question.IQuestionListener;
        private setSEO();
        private focus_for_key();
        private setupQuestions();
        public setMode(m: model.MODE): void;
        public getModeString(): string;
        public inTestMode(): boolean;
        public inPractiseMode(): boolean;
        public inReviewMode(): boolean;
        private displayQuestionsByRetraval(retrival);
        public reportResult(): void;
        public navigateTo(index: number): void;
        private setQuestionToDisplay(index, force?);
        public previous(): void;
        public isLogin(): boolean;
        public submitMark(): void;
        public next(): void;
        public flag(q: model.QuestionVM): void;
        public edit(q: model.QuestionVM): void;
        public report(q: model.QuestionVM, type: string): void;
        public toggle_display(name: string): void;
        public key_pressed(event: any): void;
        public finish_review(): void;
        public review_the_test(): void;
        private doing_review_with_question(qs);
        public review_practise(): void;
        public allAnswered(): boolean;
        public getAnsweredPercentage(): number;
        public resetQuestions(): void;
        private reset();
        private resetScope();
    }
    interface IPractiseScope extends ng.IScope {
        vm: PractiseController;
        questions: model.QuestionVM[];
        question: model.QuestionVM;
        questionIndex: number;
        totalQuestions: number;
        score: base.IQuestionScore;
        explain_collapse: boolean;
        help_collapse: boolean;
        search_collapse: boolean;
        countdown: number;
        loadPromiseTracker: ng.promisetracker.IPromiseTracker;
    }
}
export = practise;
