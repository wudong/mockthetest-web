define(["require", "exports", 'app/model', 'app/practise/reportctrl', 'app/practise/commonctrl'], function(require, exports, model, report, base) {
    var practise;
    (function (practise) {
        var BrowseController = (function () {
            function BrowseController($scope, $log, testSrv, $modal, $location, $routeParams, $q, $anchorScroll, promiseTracker, $interval, type) {
                var _this = this;
                this.questionListener = {
                    answerClicked: function (question) {
                        _this.base.answerIsGiven(question);
                    },
                    tagQuestion: function (tag, question) {
                        _this.base.tagQuestion(tag, question);
                    }
                };
                this.scope = $scope;
                this.testService = testSrv;
                this.scope.vm = this;
                this.scope.questions = [];
                this.logger = $log;
                this.modal = $modal;
                this.locationService = $location;
                this.routeParams = $routeParams;
                this.anchorScroll = $anchorScroll;
                this.scope.loadPromiseTracker = promiseTracker();
                this.base = new base.CommonControl($log, testSrv, $modal, $location, $q, $interval);

                this.browseMode = type;

                this.scope.pagination = model.Constance.Number_Of_Question;

                this.prepareQuestionsWithRoute();

                (this.scope.$parent.vm).setShowIntro(false);

                this.scope.$on('$routeUpdate', function () {
                    _this.logger.debug("route has been updated to: " + _this.locationService.absUrl());
                    _this.prepareQuestionsWithRoute();
                });
            }
            BrowseController.prototype.goto_top = function () {
                this.locationService.hash('pagination_div');

                this.anchorScroll();
            };

            BrowseController.prototype.prepareQuestionsWithRoute = function () {
                var _this = this;
                this.logger.debug("to preparing questions for display");
                this.resetScope();

                var promise = null;

                if (this.browseMode === 'all') {
                    this._type = 'all';
                    promise = this.browse_for_all(this.routeParams.page);
                } else if (this.browseMode === 'type') {
                    var type = this.routeParams.type;
                    var value = this.routeParams.value;
                    var page = this.routeParams.page;

                    this._type = type;
                    this._value = value;

                    if (type === 'search') {
                        this.browse_by_search(value, page);
                    } else if (type === 'report') {
                        this.browse_by_report(value, page);
                    } else if (type === 'tag') {
                        this.browse_by_tag(value, page);
                    } else if (type === 'ids') {
                        this.browse_by_id(value);
                    }
                }

                if (promise !== null) {
                    promise.then(function () {
                        _.delay(function () {
                            _this.testService.setPrerenderDone();
                        }, 2000);
                    });
                }
            };

            BrowseController.prototype.browse_by_id = function (ids) {
                var _this = this;
                this.testService.setSEOInfo("Life In the UK Test Questions", []);
                return this.displayQuestionsByRetraval(function () {
                    var split = ids.split(',');
                    return _this.testService.findQuestionByIds(split);
                }, 1);
            };

            BrowseController.prototype.browse_by_tag = function (tag, page) {
                var _this = this;
                this.testService.setSEOInfo("Question of Tag: " + tag + (page ? (" - Page " + page) : ""), ['Tag', 'Category', tag], 'Life in the UK Test question bank includes comprehensive questions from many sources. Browse the questions by tags and category');

                return this.displayQuestionsByRetraval(function () {
                    return _this.testService.getQuestionByTag(tag);
                }, page);
            };

            BrowseController.prototype.browse_by_report = function (reporttype, page) {
                var _this = this;
                this.testService.setSEOInfo("User Session and Progress Report" + (page ? (" - Page " + page) : ""), ['Report', 'Session'], "Show the user's session and overall progress and browse all the questions of interest to the user.");

                return this.displayQuestionsByRetraval(function () {
                    return _this.testService.getQuestionsToBrowseByType(reporttype);
                }, page);
            };

            BrowseController.prototype.browse_by_search = function (search, page) {
                var _this = this;
                this.testService.setSEOInfo("Search for Questions: " + search + (page ? (" - Page " + page) : ""), ['Search', search], 'Search for questions in the Life in the UK Question Bank');

                return this.displayQuestionsByRetraval(function () {
                    return _this.testService.searchQuestions(search);
                }, page);
            };

            BrowseController.prototype.browse_for_all = function (page) {
                var _this = this;
                this.logger.debug("browsing for page : " + page);
                this.testService.setSEOInfo("Browse the Questions Bank" + (page ? (" - Page " + page) : ""), ['Browse', "Question Bank", "Real Test Question"], 'Life in the UK Test question bank includes comprehensive questions from many sources to fully cover all the topics of the test.' + ' It includes questions reported by people that have taken the test.');
                return this.displayQuestionsByRetraval(function () {
                    var allQuestionVMs = _this.testService.getAllQuestionVMs(false);

                    if (allQuestionVMs === null)
                        return null;
                    else {
                        allQuestionVMs.sort(function (a, b) {
                            return a.question._id.localeCompare(b.question._id);
                        });
                        return allQuestionVMs;
                    }
                }, page);
            };

            BrowseController.prototype.getSearchStringParam = function (page) {
                var result = "";
                if (this.browseMode === 'all') {
                    result += ("all/" + page);
                } else if (this.browseMode === 'type') {
                    result += (this._type + "/" + this._value + "/" + page);
                }
                return result;
            };

            BrowseController.prototype.search = function () {
                this.testService.addToRecentSearch(this.scope.search_text);
                this.toggle_display('search');
                this.locationService.path('/question-browse/search/' + this.scope.search_text);
            };

            BrowseController.prototype.getRecentSearches = function () {
                return this.testService.getRecentSearch();
            };

            BrowseController.prototype.displayQuestionsByRetraval = function (retrival, page) {
                var _this = this;
                this.logger.debug("To display with page number: " + page);
                var then = this.base.displayQuestionsByRetraval(retrival, function (qs) {
                    _this.logger.debug("Loading question for display success, question number: " + qs.length);
                    _this.scope.questions = qs;
                    _this.scope.totalQuestions = qs.length;

                    var pageNumber = _this.getTotalPagesNumber();
                    _this.scope.total_page = pageNumber;
                    _this.scope.page_index = [];

                    for (var index = 0; index < pageNumber; index++) {
                        _this.scope.page_index.push(index + 1);
                    }

                    if (pageNumber > 1) {
                        var pp = (page) || 1;
                        if (_.isString(pp)) {
                            pp = parseInt(pp);
                        }
                        _this.setUpPageQuestions(pp);
                    } else {
                        _this.scope.page_questions = _.union(_this.scope.questions);
                    }
                });

                this.scope.loadPromiseTracker.addPromise(then);
                return then;
            };

            BrowseController.prototype.setUpPageQuestions = function (page) {
                if (page <= 0 || page > this.scope.total_page) {
                    this.logger.debug("page requested is out of range: " + page);
                    page = 1;
                }

                var questionPerPage = this.scope.pagination || 0;
                if (questionPerPage === 0) {
                    this.logger.warn("the pagination is not set.");
                    return;
                }

                this.scope.page_questions = [];
                var start = (page - 1) * questionPerPage;
                var end = Math.min(start + questionPerPage, this.scope.questions.length);
                for (var index = start; index < end; index++) {
                    this.scope.page_questions.push(this.scope.questions[index]);
                }
                this.scope.current_page = page;
                this.logger.debug("set the current page to: " + page);
            };

            BrowseController.prototype.getTotalPagesNumber = function () {
                var questionPerPage = this.scope.pagination || 0;
                var totalNumer = this.scope.totalQuestions;
                if (questionPerPage === 0)
                    return 1;
                else {
                    var v = totalNumer / questionPerPage;
                    return Math.ceil(v);
                }
            };

            BrowseController.prototype.submitMark = function () {
                this.base.submitMark();
            };

            BrowseController.prototype.reportResult = function () {
                var result = _(this.scope.questions).countBy(function (q) {
                    return q.success ? 'right' : 'wrong';
                });

                result.time_used = 10000;

                if (!result.right)
                    result.right = 0;
                if (!result.wrong)
                    result.wrong = 0;

                var setting = {
                    templateUrl: '/app/practise/report.html',
                    controller: report.ResultReportController,
                    resolve: {
                        result: function () {
                            return result;
                        }
                    }
                };
            };

            BrowseController.prototype.edit = function (q) {
                this.base.edit(q);
            };

            BrowseController.prototype.flag = function (q) {
                this.base.flag(q);
            };

            BrowseController.prototype.report = function (q, type) {
                this.base.report(q, type);
            };

            BrowseController.prototype.toggle_display = function (name) {
                var prop = name + "_collapse";
                this.scope[prop] = !this.scope[prop];
            };

            BrowseController.prototype.displayHelp = function () {
            };

            BrowseController.prototype.resetScope = function () {
                this.scope.search_collapse = true;
                this.scope.current_page = 1;
                this.scope.page_index = [];
                this.scope.total_page = 1;
                this.scope.questions = [];
                this.scope.page_questions = [];
            };
            BrowseController.$inject = [
                '$scope', '$log', 'testService', '$modal', '$location', '$routeParams', '$q',
                '$anchorScroll', 'promiseTracker', '$interval', 'type'
            ];
            return BrowseController;
        })();
        practise.BrowseController = BrowseController;

        
    })(practise || (practise = {}));
    
    return practise;
});
//# sourceMappingURL=browsectrl.js.map
