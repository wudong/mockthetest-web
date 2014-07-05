/// <reference path="../../__all.d.ts" />
import service = require('app/service');
import model = require('app/model');
import question = require('app/question/question');
import base = require('app/practise/commonctrl');
declare module practise {
    class BrowseController {
        public scope: IBrowseScope;
        public logger: ng.ILogService;
        public testService: service.TestService;
        public modal: ng.ui.bootstrap.IModalService;
        public locationService: ng.ILocationService;
        public routeParams: IBrowseRouteParam;
        public base: base.CommonControl;
        public anchorScroll: ng.IAnchorScrollService;
        public browseMode: string;
        private _type;
        private _value;
        static $inject: string[];
        constructor($scope: IBrowseScope, $log: ng.ILogService, testSrv: service.TestService, $modal: ng.ui.bootstrap.IModalService, $location: ng.ILocationService, $routeParams: IBrowseRouteParam, $q: ng.IQService, $anchorScroll: ng.IAnchorScrollService, promiseTracker: ng.promisetracker.IPromiseTrackerService, $interval: ng.IIntervalService, type: string);
        public questionListener: question.IQuestionListener;
        public goto_top(): void;
        private prepareQuestionsWithRoute();
        private browse_by_id(ids);
        private browse_by_tag(tag, page);
        private browse_by_report(reporttype, page);
        private browse_by_search(search, page);
        private browse_for_all(page);
        public getSearchStringParam(page: number): string;
        public search(): void;
        public getRecentSearches(): string[];
        private displayQuestionsByRetraval(retrival, page?);
        private setUpPageQuestions(page);
        private getTotalPagesNumber();
        public submitMark(): void;
        public reportResult(): void;
        public edit(q: model.QuestionVM): void;
        public flag(q: model.QuestionVM): void;
        public report(q: model.QuestionVM, type: string): void;
        public toggle_display(name: string): void;
        public displayHelp(): void;
        private resetScope();
    }
    interface IBrowseRouteParam extends ng.route.IRouteParamsService {
        page: string;
        type: string;
        value: string;
    }
    interface IBrowseScope extends ng.IScope {
        vm: BrowseController;
        questions: model.QuestionVM[];
        page_questions: model.QuestionVM[];
        current_page: number;
        page_index: number[];
        total_page: number;
        search_text: string;
        search_collapse: boolean;
        pagination: number;
        totalQuestions: number;
        loadPromiseTracker: ng.promisetracker.IPromiseTracker;
    }
}
export = practise;
