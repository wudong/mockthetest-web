/// <reference path="../__all.d.ts" />

import practise=require('app/practise/practisectrl');
import browse=require('app/practise/browsectrl');
import question=require('app/question/editctrl');
import login=require('app/login/loginctrl');
import nav=require('app/nav/navctrl');
import main=require('app/main/mainctrl');
import report=require('app/practise/reportctrl');
import service=require('app/service');
import model=require('app/model');
import qstextfilter = require('app/question/questiontextfilter');
import qsdirective=require('app/question/question');
import info=require('app/info/infoctrl');


module oltest{
    'use strict';
    export function config(angular) {
        var app:ng.IModule = angular.module('testApp',
            //the dependencies of the module.
            ['restangular', 'timer', 'ui.bootstrap', 'ngCookies',
                'ngStorage', 'ngRoute', 'ngSanitize', 'ajoslin.promise-tracker',
                'angulartics', 'angulartics.google.analytics'
            ])
            .controller('practiseCtrl', practise.PractiseController)
            .controller('qEditCtrl', question.QuestionEditController)
            .controller('loginCtrl', login.UserLoginController)
            .controller('reportCtrl', report.ResultReportController)
            .controller('navCtrl', nav.NavigationController)
            .controller('browseCtrl', browse.BrowseController)
            .controller('mainCtrl', main.MainController)
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
            RestangularProvider.setBaseUrl("/json");
            //instruct restangular to use '_id' instead of id in the route.
            RestangularProvider.setRestangularFields({
                id: "_id"
            });
        }]);

        app.config([
            '$locationProvider',
            function($locationProvider) {
                //$locationProvider.hashPrefix('!');
                $locationProvider.html5Mode(true).hashPrefix('!');

            }
        ]);

        app.config(['$logProvider', function ($logProvider){
            //To disable debug logs.
            $logProvider.debugEnabled = false;
        }]);

        app.config(['$routeProvider', (routeProvider: ng.route.IRouteProvider)=>{
            routeProvider.when('/question-practise', {
                templateUrl: 'app/practise/practise.html',
                controller: 'practiseCtrl',
                reloadOnSearch: false,
                resolve:{
                    mode: ()=>{return model.MODE.practise}
                }
            })
            .when('/question-browse', {
                    redirectTo: '/question-browse/all/1'
                })
            .when('/question-browse/all/:page', {
                templateUrl: 'app/practise/browse.html',
                controller: 'browseCtrl',
                reloadOnSearch: false,
                resolve:{
                    type: ()=>{return 'all'}
                }
            })
            .when('/question-browse/:type/:value/:page?', {
                templateUrl: 'app/practise/browse.html',
                controller: 'browseCtrl',
                reloadOnSearch: false,

                resolve:{
                    type: ()=>{return 'type'}
                }
            })
            .when('/question-test', {
                    templateUrl: 'app/practise/practise.html',
                    controller: 'practiseCtrl',
                    resolve:{
                        mode: ()=>{return model.MODE.test}
                    }
                });
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
