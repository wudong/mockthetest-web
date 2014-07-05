/// <reference path="../../__all.d.ts" />
import service = require('app/service');
declare module main {
    class MainController {
        public scope: IMainPageScope;
        public loc: ng.ILocationService;
        public logger: ng.ILogService;
        public analytics: ng.angulartics.IAnalyticsService;
        static $inject: string[];
        constructor($scope: IMainPageScope, $log: ng.ILogService, $location: ng.ILocationService, $analytics: ng.angulartics.IAnalyticsService, $document: ng.IDocumentService, testService: service.TestService);
        public setShowIntro(show: boolean): void;
    }
    interface IMainPageScope extends ng.IScope {
        vm: MainController;
        show_intro: boolean;
        seo: service.SEOInfoObject;
    }
}
export = main;
