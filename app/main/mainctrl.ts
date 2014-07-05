/// <reference path="../../__all.d.ts" />

import service=require('app/service');

module main
{
    export class MainController {
        scope:IMainPageScope;
        loc: ng.ILocationService;
        logger: ng.ILogService;
        analytics: ng.angulartics.IAnalyticsService;

        public static $inject = [
            '$scope',  '$log', '$location', '$analytics', '$document','testService'
        ];

        constructor($scope:IMainPageScope, $log:ng.ILogService, $location: ng.ILocationService,
                    $analytics: ng.angulartics.IAnalyticsService, $document: ng.IDocumentService,
                    testService: service.TestService) {
            this.scope = $scope;
            this.scope.vm = this;
            this.analytics = $analytics;
            this.loc = $location;
            this.logger = $log;
            this.scope.show_intro=true;

            testService.mainControl = this;
            this.scope.seo = testService.getSEOObject();

            this.scope.$on('$routeChangeSuccess', ()=>{
                var path = this.loc.path();
                if (path==='/'){
                    this.scope.seo.reset();
                    this.scope.show_intro=true;
                }else{
                    this.scope.show_intro=false;
                }
            })

            this.scope.$watch("seo.getTitle()", ()=>{
                this.logger.debug("title  need change to: " + this.scope.seo.getTitle());
                this.logger.debug("current title: " + $document[0].title);
                (<any>($document[0])).title = this.scope.seo.getTitle();
            })
        }

        public setShowIntro( show: boolean){
            this.scope.show_intro = show;
        }
    }

    export interface IMainPageScope extends ng.IScope {
        vm: MainController;
        show_intro: boolean;
        //show_info: boolean;
        seo: service.SEOInfoObject;
    }
}

export=main;