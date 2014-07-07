/// <reference path="../__all.d.ts" />

import practise=require('app/practise/practisectrl');
import browse=require('app/practise/browsectrl');
import question=require('app/question/editctrl');
import report=require('app/practise/reportctrl');
import service=require('app/service');
import model=require('app/model');
import qstextfilter = require('app/question/questiontextfilter');
import qsdirective=require('app/question/question');
import info=require('app/info/infoctrl');

module oltest{
    'use strict';

    export function config(angular) {
        var app:ng.IModule = angular.module('testMobileApp',
            //the dependencies of the module.
            ['restangular', 'timer', 'ngSanitize', 'angulartics', 'angulartics.google.analytics.cordova', 'ui.router'])
            .controller('practiseCtrl', practise.PractiseController)
            .controller('qEditCtrl', question.QuestionEditController)
            .controller('reportCtrl', report.ResultReportController)
            .controller('browseCtrl', browse.BrowseController)
            .controller('infoCtrl', info.InfoController);

        app.filter('emphasis_two', ()=>{
            return (text)=> {
                return qstextfilter.QuestionTextFilter.question_two_mark_important(text)
            };
        });

        app.service('testService', service.TestService);
        app.directive('questionDirective', qsdirective.directive);

        //configure the restangular.js
        app.config(['RestangularProvider', (RestangularProvider:restangular.IProvider)=> {
            RestangularProvider.setBaseUrl("/test_html/json");
            RestangularProvider.setRequestSuffix('.json');
            //instruct restangular to use '_id' instead of id in the route.
            RestangularProvider.setRestangularFields({
                id: "_id"
            });
        }]);

        app.config(['$logProvider', function ($logProvider){
            //To disable debug logs.
            $logProvider.debugEnabled = false;
        }]);



//
//        app.run((testService: service.TestService, $log: ng.ILogService)=>{
//            $log.debug("Post Loading Initialization Start");
//            testService.initializeService();
//        });


        //http://solutionoptimist.com/2013/10/07/enhance-angularjs-logging-using-decorators/
//        app.config([ "$provide", function( $provide )
//        {
//            // Use the `decorator` solution to substitute or attach behaviors to
//            // original service instance; @see angular-mocks for more examples....
//
//            $provide.decorator( '$log', [ "$delegate", function( $delegate )
//            {
//                // Save the original $log.debug()
//                var debugFn = $delegate.debug;
//
//                $delegate.debug = function( )
//                {
//                    var args    = [].slice.call(arguments),
//                        now     = DateTime.formattedNow();
//
//                    // Prepend timestamp
//                    args[0] = supplant("{0} - {1}", [ now, args[0] ]);
//
//                    // Call the original with the output prepended with formatted timestamp
//                    debugFn.apply(null, args)
//                };
//
//                return $delegate;
//            }]);
//        }]);

        return app;
    }
}

export = oltest;
