define(["require", "exports", 'app/practise/practisectrl', 'app/practise/browsectrl', 'app/question/editctrl', 'app/login/loginctrl', 'app/nav/navctrl', 'app/main/mainctrl', 'app/practise/reportctrl', 'app/service', 'app/model', 'app/question/questiontextfilter', 'app/question/question', 'app/info/infoctrl'], function(require, exports, practise, browse, question, login, nav, main, report, service, model, qstextfilter, qsdirective, info) {
    var oltest;
    (function (oltest) {
        'use strict';
        function config(angular) {
            var app = angular.module('testApp', [
                'restangular', 'timer', 'ui.bootstrap', 'ngCookies',
                'ngStorage', 'ngRoute', 'ngSanitize', 'ajoslin.promise-tracker',
                'angulartics', 'angulartics.google.analytics'
            ]).controller('practiseCtrl', practise.PractiseController).controller('qEditCtrl', question.QuestionEditController).controller('loginCtrl', login.UserLoginController).controller('reportCtrl', report.ResultReportController).controller('navCtrl', nav.NavigationController).controller('browseCtrl', browse.BrowseController).controller('mainCtrl', main.MainController).controller('infoCtrl', info.InfoController);

            app.filter('emphasis_two', function () {
                return function (text) {
                    return qstextfilter.QuestionTextFilter.question_two_mark_important(text);
                };
            });

            app.service('testService', service.TestService);
            app.directive('questionDirective', qsdirective.directive);

            app.config([
                'RestangularProvider', function (RestangularProvider) {
                    RestangularProvider.setBaseUrl("/json");

                    RestangularProvider.setRestangularFields({
                        id: "_id"
                    });
                }]);

            app.config([
                '$locationProvider',
                function ($locationProvider) {
                    $locationProvider.html5Mode(true).hashPrefix('!');
                }
            ]);

            app.config([
                '$logProvider', function ($logProvider) {
                    $logProvider.debugEnabled = false;
                }]);

            app.config([
                '$routeProvider', function (routeProvider) {
                    routeProvider.when('/question-practise', {
                        templateUrl: 'app/practise/practise.html',
                        controller: 'practiseCtrl',
                        reloadOnSearch: false,
                        resolve: {
                            mode: function () {
                                return 0 /* practise */;
                            }
                        }
                    }).when('/question-browse', {
                        redirectTo: '/question-browse/all/1'
                    }).when('/question-browse/all/:page', {
                        templateUrl: 'app/practise/browse.html',
                        controller: 'browseCtrl',
                        reloadOnSearch: false,
                        resolve: {
                            type: function () {
                                return 'all';
                            }
                        }
                    }).when('/question-browse/:type/:value/:page?', {
                        templateUrl: 'app/practise/browse.html',
                        controller: 'browseCtrl',
                        reloadOnSearch: false,
                        resolve: {
                            type: function () {
                                return 'type';
                            }
                        }
                    }).when('/question-test', {
                        templateUrl: 'app/practise/practise.html',
                        controller: 'practiseCtrl',
                        resolve: {
                            mode: function () {
                                return 1 /* test */;
                            }
                        }
                    });
                }]);

            return app;
        }
        oltest.config = config;
    })(oltest || (oltest = {}));

    
    return oltest;
});
//# sourceMappingURL=testApp.js.map
