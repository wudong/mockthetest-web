define(["require", "exports", 'app/model', 'app/practise/reportctrl', 'app/question/editctrl'], function(require, exports, model, report, edit) {
    var practise;
    (function (practise) {
        var IQuestionScore = (function () {
            function IQuestionScore() {
            }
            IQuestionScore.prototype.allAnswered = function () {
                return this.totalQuestions === this.answeredQuestions;
            };
            return IQuestionScore;
        })();
        practise.IQuestionScore = IQuestionScore;

        var CommonControl = (function () {
            function CommonControl($log, testSrv, $modal, $location, $q, $interval) {
                this.testService = testSrv;
                this.logger = $log;
                this.modal = $modal;
                this.q = $q;
                this.locationService = $location;
                this.interval = $interval;
            }
            CommonControl.prototype.tagQuestion = function (tag, question) {
                this.testService.tagQuestion(tag, question, function (success, msg) {
                    if (success) {
                        _(question.tags).each(function (t) {
                            if (t.tag === tag) {
                                t.selected = true;
                            }
                        });
                    }
                });
            };

            CommonControl.prototype.updateQuestions = function () {
                var _this = this;
                this.testService.retrieveQuestions(true, function (n) {
                    if (n >= 0) {
                        _this.testService.displayMessage(n + " questions are updated from server", "info");
                    } else if (n == -1) {
                        _this.testService.displayMessage("Update questions from server failed");
                    }
                });
            };

            CommonControl.prototype.retrieveQuestionForDisplay = function (retrival) {
                var _this = this;
                var deferred = this.q.defer();

                var start_time = Date.now();

                var cancel = this.interval(function () {
                    var qs = retrival();

                    if (qs !== null) {
                        _this.logger.debug("Question retrieved from service: " + qs.length);

                        _(qs).each(function (q) {
                            q.reset();
                        });

                        var currentTime = Date.now() - start_time;
                        _this.logger.debug("Time (milliseconds) used to retrieve questions: " + currentTime);
                        _this.interval.cancel(cancel);
                        deferred.resolve(qs);
                    } else {
                        var currentTime = Date.now() - start_time;
                        if (currentTime > 20 * 1000) {
                            _this.logger.debug("Cannot found any questions, and time out");
                            _this.testService.displayMessage("Cannot retrieve any question, please try to refresh the page", "warn", 6000);
                            _this.interval.cancel(cancel);
                            deferred.reject();
                        } else {
                            _this.logger.debug("Initialization is not ready. will retry in 300 miliseconds");
                        }
                    }
                }, 100);

                return deferred.promise;
            };

            CommonControl.prototype.calculateScore = function (qs) {
                var result = new IQuestionScore();
                var rightCount = 0;
                var answerdCount = 0;
                _(qs).each(function (q) {
                    if (q.success === true) {
                        rightCount++;
                    }

                    if (q.success || q.not_success) {
                        answerdCount++;
                    }
                });
                result.totalQuestions = qs.length;
                result.correctlyAnsweredQuestions = rightCount;
                result.answeredQuestions = answerdCount;
                result.passed = (result.correctlyAnsweredQuestions / result.totalQuestions) >= model.Constance.Passing_Rate;
                return result;
            };

            CommonControl.prototype.reportResult = function (qs) {
                var result = _(qs).countBy(function (q) {
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

                this.modal.open(setting).result.then(function (option) {
                });
            };

            CommonControl.prototype.submitMark = function () {
                var _this = this;
                if (this.testService.isLogin()) {
                    this.testService.sendingMark(function (n) {
                        if (n > 0) {
                            _this.testService.displayMessage(n + " questions submitted.");
                        } else {
                            _this.testService.displayMessage("No new marks to be send.");
                        }
                    });
                } else {
                    this.testService.displayMessage("Saving mark and track history is only for registered user!");
                }
            };

            CommonControl.prototype.flag = function (q) {
                var qvm = q;
                qvm.flagged = !qvm.flagged;
                if (qvm.flagged === true) {
                    qvm.to_review = true;
                    this.testService.addToReview(q);
                }
                this.testService.flagQuestion(qvm, qvm.flagged);
            };

            CommonControl.prototype.answerIsGiven = function (q) {
                if (q.answered === true) {
                    if (q.success && !q.flagged) {
                        this.testService.removeFromReview(q);
                    } else if (q.not_success && !q.flagged) {
                        this.testService.addToReview(q);
                    }

                    this.testService.markQuestion(q, q.success);
                    this.testService.updateSessionInfo();
                }
            };

            CommonControl.prototype.edit = function (q) {
                var _this = this;
                if (this.testService.isLogin()) {
                    var setting = {
                        templateUrl: '/app/question/questionform.html',
                        controller: edit.QuestionEditController,
                        resolve: {
                            question: function () {
                                return q;
                            }
                        }
                    };

                    return this.modal.open(setting).result.then(function (option) {
                        if (option === 'save') {
                            _this.save(q);
                        } else if (option === 'delete') {
                            _this.delete(q);
                        } else if (_.isObject(option)) {
                            if (option.operation === 'create' && option.question) {
                                _this.create(option.question);
                            }
                        }
                    });
                } else {
                    this.testService.displayMessage("No privilege to edit question.");
                }
            };

            CommonControl.prototype.displayQuestionsByRetraval = function (retrival, callback) {
                var _this = this;
                var promise = this.retrieveQuestionForDisplay(retrival);

                var then = promise.then(function (qs) {
                    _this.logger.debug("Loading question for display success, loaded questions: " + qs.length);
                    callback(qs);
                }, function () {
                    _this.logger.debug("Cannot found any questions");
                    _this.testService.displayMessage("Cannot retrieve any question, please try to refresh the page", "warn", 6000);
                });

                return then;
            };

            CommonControl.prototype.report = function (q, type) {
                this.logger.debug("Question of ID %s is been reported need improvement with type %s.", q.question._id, model.ReportType[type]);

                this.testService.reportQuestion(q, model.ReportType[type], function (success, msg) {
                });
            };

            CommonControl.prototype.save = function (q) {
                var _this = this;
                this.testService.saveQuestion(q, function (succ, message) {
                    if (succ) {
                        _this.testService.displayMessage("Question is updated successfully.", "info");
                    } else {
                        _this.testService.displayMessage("Update question failed!");
                    }
                });
            };

            CommonControl.prototype.create = function (q) {
                var _this = this;
                this.testService.createQuestion(q, function (succ, message) {
                    if (succ) {
                        _this.testService.displayMessage("Question is create successfully.", "info");
                    } else {
                        _this.testService.displayMessage("Creating question failed!");
                    }
                });
            };

            CommonControl.prototype.delete = function (q) {
                var _this = this;
                this.testService.deleteQuestion(q, function (succ, message) {
                    if (succ) {
                        _this.testService.displayMessage("Question is deleted successfully.", "info");
                    } else {
                        _this.testService.displayMessage("Delete question failed!");
                    }
                });
            };
            return CommonControl;
        })();
        practise.CommonControl = CommonControl;
    })(practise || (practise = {}));
    
    return practise;
});
//# sourceMappingURL=commonctrl.js.map
