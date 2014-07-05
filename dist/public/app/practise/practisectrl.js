define(["require", "exports", 'app/model', 'app/practise/reportctrl', 'app/practise/commonctrl'], function(require, exports, model, report, base) {
    var practise;
    (function (practise) {
        var PractiseController = (function () {
            function PractiseController($scope, $log, testSrv, $interval, $timeout, $modal, $location, $routeParams, promiseTracker, $q, mode) {
                var _this = this;
                this.indexLabelMap = {
                    0: 'A', 1: 'B', 2: 'C', 3: 'D', 4: 'E', 5: 'F'
                };
                this._num_key_previous = 0;
                this.questionListener = {
                    answerClicked: function (question) {
                        var iQuestionScore = _this.base.calculateScore(_this.scope.questions);
                        _this.scope.score = iQuestionScore;
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
                this.intervalService = $interval;
                this.timeoutService = $timeout;
                this.modal = $modal;
                this.locationService = $location;
                this.routeParams = $routeParams;
                this.scope.loadPromiseTracker = promiseTracker();

                this.base = new base.CommonControl($log, testSrv, $modal, $location, $q, $interval);

                this.mode = mode;

                this.setupQuestions();
                this.setSEO();

                (this.scope.$parent.vm).setShowIntro(false);
            }
            PractiseController.prototype.setSEO = function () {
                if (this.mode === 1 /* test */) {
                    this.testService.setSEOInfo('Test Simulator', ['Simulator', 'Emulate', 'Real Test Environment'], 'A Life in the UK Test simulator/emulator that simulate the real test environment. It is good to test your capability of the test.');
                }
                if (this.mode === 0 /* practise */) {
                    this.testService.setSEOInfo('Practice with the questions', [], 'Practise with the all the question i the question back in the simulated app. It helps to record your practise progress present ' + 'the best questions for you according to your history.');
                }
            };

            PractiseController.prototype.focus_for_key = function () {
                $('#practise-main-body').focus();
            };

            PractiseController.prototype.setupQuestions = function () {
                var _this = this;
                this.logger.debug("To preparing questions for display");
                this.resetScope();

                this.displayQuestionsByRetraval(function () {
                    var allQuestionVMs = _this.testService.getAllQuestionVMs(true);
                    if (allQuestionVMs === null)
                        return null;

                    var number = (allQuestionVMs.length >= model.Constance.Number_Of_Question) ? model.Constance.Number_Of_Question : allQuestionVMs.length;

                    if (number >= 0) {
                        return _.chain(allQuestionVMs).last(number).shuffle().value();
                    }
                });
            };

            PractiseController.prototype.setMode = function (m) {
                if (this.mode === m)
                    return;
                else {
                    this.pre_mode = this.mode;
                    this.mode = m;
                }
            };

            PractiseController.prototype.getModeString = function () {
                return model.MODE[this.mode];
            };

            PractiseController.prototype.inTestMode = function () {
                return this.mode === 1 /* test */;
            };
            PractiseController.prototype.inPractiseMode = function () {
                return this.mode === 0 /* practise */;
            };
            PractiseController.prototype.inReviewMode = function () {
                return this.mode === 2 /* review */;
            };

            PractiseController.prototype.displayQuestionsByRetraval = function (retrival) {
                var _this = this;
                var then = this.base.displayQuestionsByRetraval(retrival, function (qs) {
                    _this.logger.debug("Loading question for display success, question number: " + qs.length);

                    _this.scope.questions = qs;
                    _this.scope.totalQuestions = qs.length;

                    _(_this.scope.questions).each(function (q) {
                        q.reset();

                        _(q.answers).each(function (aa) {
                            aa.selected = false;
                        });
                    });

                    _this.setQuestionToDisplay(0, true);
                });

                this.scope.loadPromiseTracker.addPromise(then);
            };

            PractiseController.prototype.reportResult = function () {
                var _this = this;
                if (this.inReviewMode())
                    return;

                var result = _(this.scope.questions).countBy(function (q) {
                    return q.success ? 'right' : 'wrong';
                });

                result.time_used = 10000;

                if (!result.right)
                    result.right = 0;
                if (!result.wrong)
                    result.wrong = 0;

                result.mode = this.getModeString();

                var setting = {
                    templateUrl: '/app/practise/report.html',
                    controller: report.ResultReportController,
                    resolve: {
                        result: function () {
                            return result;
                        }
                    }
                };

                this.modal.open(setting).result.then(function (option) {
                    if (option === 'review') {
                        if (_this.inTestMode()) {
                            _this.review_the_test();
                        } else if (_this.inPractiseMode()) {
                            _this.review_practise();
                        }
                    } else if (option === 'another') {
                        _this.resetQuestions();
                    }
                });
            };

            PractiseController.prototype.navigateTo = function (index) {
                this.setQuestionToDisplay(index);
            };

            PractiseController.prototype.setQuestionToDisplay = function (index, force) {
                if (index < 0 || index >= this.scope.questions.length) {
                    this.logger.debug("index out of range " + index);
                    return;
                }

                if ((this.scope.questionIndex !== index) || force) {
                    var qvm = this.scope.questions[index];

                    qvm.current = true;
                    if (this.scope.question != null) {
                        this.scope.question.current = false;
                    }

                    this.scope.question = qvm;
                    this.scope.questionIndex = index;

                    this.scope.explain_collapse = true;
                }
            };

            PractiseController.prototype.previous = function () {
                if (this.scope.questionIndex > 0)
                    this.setQuestionToDisplay(this.scope.questionIndex - 1);
            };

            PractiseController.prototype.isLogin = function () {
                return this.testService.isLogin();
            };

            PractiseController.prototype.submitMark = function () {
                this.base.submitMark();
            };

            PractiseController.prototype.next = function () {
                if (this.scope.questionIndex < this.scope.questions.length - 1) {
                    this.setQuestionToDisplay(this.scope.questionIndex + 1);
                } else if (this.scope.questionIndex === this.scope.questions.length - 1) {
                    if (this.indexLabelMap)
                        this.reportResult();
                }
            };

            PractiseController.prototype.flag = function (q) {
                this.base.flag(q);
            };

            PractiseController.prototype.edit = function (q) {
                this.base.edit(q);
            };

            PractiseController.prototype.report = function (q, type) {
                this.base.report(q, type);
            };

            PractiseController.prototype.toggle_display = function (name) {
                var prop = name + "_collapse";
                this.scope[prop] = !this.scope[prop];
            };

            PractiseController.prototype.key_pressed = function (event) {
                if (!this.scope.question)
                    return;

                if (event.keyCode === 74 || event.keyCode === 37) {
                    this.previous();
                } else if (event.keyCode === 75 || event.keyCode === 39) {
                    this.next();
                } else if (event.keyCode === 82) {
                } else if (event.keyCode === 72) {
                    this.toggle_display('help');
                } else if (event.keyCode === 69) {
                    this.edit(this.scope.question);
                } else if (event.keyCode === 77) {
                    this.flag(this.scope.question);
                }
            };

            PractiseController.prototype.finish_review = function () {
                if (this.mode !== 2 /* review */)
                    return;
                else {
                    this.setMode(this.pre_mode);
                    this.resetQuestions();
                }
            };

            PractiseController.prototype.review_the_test = function () {
                var qs = _(this.scope.questions).filter(function (q) {
                    return (q.success) !== true;
                });

                if (qs.length === 0) {
                    this.testService.displayMessage("Nothing to review, all question has been answered correctly!", 'info');
                    return;
                }

                this.doing_review_with_question(qs);
            };

            PractiseController.prototype.doing_review_with_question = function (qs) {
                this.setMode(2 /* review */);

                this.resetScope();

                this.scope.questions = qs;
                this.scope.totalQuestions = qs.length;

                this.setQuestionToDisplay(0);
            };

            PractiseController.prototype.review_practise = function () {
                var qs = this.testService.getQuestionsForReview();

                if (qs.length === 0) {
                    this.testService.displayMessage("Nothing to review, all question has been answered correctly!", "info");
                    return;
                }

                this.doing_review_with_question(qs);
            };

            PractiseController.prototype.allAnswered = function () {
                return this.scope.score.allAnswered();
            };

            PractiseController.prototype.getAnsweredPercentage = function () {
                if (this.inTestMode()) {
                    return 100 * (this.scope.score.answeredQuestions / this.scope.score.totalQuestions);
                } else {
                    return 100 * (this.scope.score.answeredQuestions - this.scope.score.correctlyAnsweredQuestions) / this.scope.score.totalQuestions;
                }
            };

            PractiseController.prototype.resetQuestions = function () {
                var _this = this;
                if (this.isLogin()) {
                    this.testService.sendingMark(function (n) {
                        if (n > 0) {
                            _this.testService.displayMessage(n + " questions submitted", "info");
                        }
                        _this.reset();
                    });
                } else {
                    this.reset();
                }
            };

            PractiseController.prototype.reset = function () {
                if (this.locationService.search() && this.locationService.search().st) {
                    this.locationService.search('st', null);
                } else {
                    this.scope.questions = [];
                    this.resetScope();
                    this.setupQuestions();
                }
            };

            PractiseController.prototype.resetScope = function () {
                this.scope.score = new base.IQuestionScore();

                this.scope.countdown = 40 * 60;

                this.scope.explain_collapse = true;
                this.scope.search_collapse = true;
            };
            PractiseController.$inject = [
                '$scope', '$log', 'testService', '$interval', '$timeout', '$modal', '$location', '$routeParams',
                'promiseTracker', '$q', 'mode'
            ];
            return PractiseController;
        })();
        practise.PractiseController = PractiseController;

        
    })(practise || (practise = {}));
    
    return practise;
});
//# sourceMappingURL=practisectrl.js.map
