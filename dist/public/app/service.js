define(["require", "exports", 'app/model', 'app/storage'], function(require, exports, model, storage) {
    var service;
    (function (service) {
        'use strict';

        var QuestionInfo = (function () {
            function QuestionInfo(q) {
                this.question = q;
                this.mark = new model.Mark();
                this.mark.question_id = this.question.question._id;
            }
            return QuestionInfo;
        })();
        service.QuestionInfo = QuestionInfo;

        var SEOInfoObject = (function () {
            function SEOInfoObject() {
                this.title = null;
                this.keywords = [];
                this.description = null;
                this.default_title = 'Life In the UK Test Real Test Questions and Practice';
                this.default_keywords = [
                    'Life in the UK Test', 'Mock Exams', 'Practice Questions', 'Settlement', 'Immigration', 'Free', 'United Kingdom',
                    'British', 'Naturalisation', 'Citizenship'];
                this.default_description = 'Best free web application to preparing the Life In the UK Test with practises and mock tests,' + ' and various information on the test itself. It keep tracks of your progress and help you preparing the test more easily.';
            }
            SEOInfoObject.prototype.get = function (prop) {
                if (this[prop])
                    return this[prop];
                else
                    return this['default_' + prop];
            };

            SEOInfoObject.prototype.set = function (prop, value) {
                this[prop] = value;
            };

            SEOInfoObject.prototype.getTitle = function () {
                if (this.title) {
                    return 'Life In the UK Test | ' + this.title;
                } else
                    return this.default_title;
            };

            SEOInfoObject.prototype.getDescription = function () {
                return this.get('description');
            };

            SEOInfoObject.prototype.getKeywords = function () {
                var result = 'Mock Test';
                _(this.keywords).each(function (s) {
                    result += ", " + s;
                });
                _(this.default_keywords).each(function (s) {
                    result += ", " + s;
                });
                return result;
            };

            SEOInfoObject.prototype.setKeywords = function (kws) {
                var _this = this;
                _(kws).each(function (s) {
                    _this.keywords.push(s);
                });
            };

            SEOInfoObject.prototype.setTitle = function (title) {
                this.set('title', title);
            };

            SEOInfoObject.prototype.setDescription = function (de) {
                this.set('description', de);
            };

            SEOInfoObject.prototype.reset = function () {
                this.title = null;
                this.keywords = [];
                this.description = null;
            };
            return SEOInfoObject;
        })();
        service.SEOInfoObject = SEOInfoObject;

        var TestService = (function () {
            function TestService($rootScope, rest, $log, $interval, q, $window, $modal) {
                var _this = this;
                this.loginUser = null;
                this.buffer_for_browse_id = [];
                this.sessionInfo = new model.SessionInfo();
                this.userInfo = new model.UserProgress();
                this.question_infos = {};
                this.logger = $log;
                this.rootScope = $rootScope;
                this.interval = $interval;
                this.q = q;
                this.questionRest = rest.all("questions");
                this.markRest = rest.all("marks");
                this.userRest = rest.all("users");
                this.rest = rest;
                this.window = $window;

                this.storage = new storage.StorageService();
                this.modal = $modal;

                this.seoObject = new SEOInfoObject();

                $window.prerenderReady = false;

                this.initUser();
                this.initSession();

                _.defer(function () {
                    _this.initializeService();
                });
            }
            TestService.prototype.getSEOObject = function () {
                return this.seoObject;
            };

            TestService.prototype.setSEOInfo = function (title, keyword, desc) {
                this.seoObject.reset();
                this.seoObject.setTitle(title);
                this.seoObject.setKeywords(keyword);
                if (desc)
                    this.seoObject.setDescription(desc);
            };

            TestService.prototype.initializeService = function () {
                var _this = this;
                this.displayMessage("Start Initialization");

                this.initAllQuestions().then(function () {
                    _this.initMarks();
                    _this.displayMessage("Initialization done!", 'info', 1000);
                    _this.logger.debug("Initialization is done");
                });

                this.interval(function () {
                    _this.updateSessionInfo();
                    _this.updateUserInfo();
                    _this.sendingMark();
                    _this.checkSessionTime();
                    _this.logger.debug("service background click");
                }, 30000);
            };

            TestService.prototype.checkSessionTime = function () {
                var sessionTime = this.getSessionTime();
                this.logger.debug("session time: " + sessionTime);
                if (!this.storage.getUserPromotionDone() && sessionTime > (1000 * 60 * 3)) {
                    this.showUserPromotion();
                }
            };

            TestService.prototype.showUserPromotion = function () {
                var _this = this;
                var iScope = this.rootScope.$new(true);
                iScope.isLogin = this.isLogin();
                iScope.sessiongTime = (this.getSessionTime() / 60000);

                var setting = {
                    templateUrl: '/app/user/promotion.html',
                    scope: iScope
                };

                this.modal.open(setting).result.then(function () {
                    _this.storage.setUserPromotionDone();
                    _this.logger.debug("Disable the promoting again.");
                });
            };

            TestService.prototype.getSessionTime = function () {
                var sessionStart = this.storage.getSessionStart();
                var date = new Date();
                var timeInSession = date.getTime() - sessionStart.getTime();
                return timeInSession;
            };

            TestService.prototype.setPrerenderDone = function () {
                this.window.prerenderReady = true;
                this.logger.debug("Prerender is set to ready");
            };

            TestService.prototype.initSession = function () {
                if (!this.storage.getSessionStart()) {
                    this.storage.setSessionStart();
                    this.storage.setMarkLastSend();
                }
            };

            TestService.prototype.getRecentSearch = function () {
                return this.storage.getRecentSearches();
            };

            TestService.prototype.addToRecentSearch = function (st) {
                this.storage.addRecentSearch(st);
            };

            TestService.prototype.addToReview = function (q) {
                this.storage.addQuestionToReview(q.question._id);
            };

            TestService.prototype.removeFromReview = function (q) {
                this.storage.removeQuestionFromReview(q.question._id);
            };

            TestService.prototype.displayMessage = function (message, type, autoDismissTime) {
                $.bootstrapGrowl(message + "&nbsp;&nbsp;", {
                    ele: 'body',
                    type: type || 'info',
                    offset: { from: 'top', amount: 20 },
                    align: 'right',
                    width: 'auto',
                    delay: autoDismissTime || 4000,
                    allow_dismiss: true,
                    stackup_spacing: 10
                });
            };

            TestService.prototype.initMarks = function () {
                var _this = this;
                this.logger.debug("Loading marks from session.");

                if (this.isLogin()) {
                    this.logger.debug("Loading marks for user from backend.");
                    this.fetchMarkForUser().then(function (mm) {
                        _(mm).each(_this.updateQuestionInfoWithMark, _this);
                        _this.logger.debug("marks are updated from server: " + mm.length);
                    }, function (e) {
                        _this.logger.warn("failed to update marks from server: " + (e || "no error msg"));
                    }).finally(function () {
                        _this.restoreSessionMarks();
                        _this.updateUserInfo();
                    });
                } else {
                    this.restoreSessionMarks();
                    this.logger.debug("Marks is not updated because the user is not login yet.");
                }
            };

            TestService.prototype.updateQuestionInfoWithMark = function (m) {
                var questionInfo = this.question_infos[m.question_id];
                if (questionInfo) {
                    questionInfo.mark.updateFrom(m);

                    if (m.flag) {
                        questionInfo.question.flagged = true;
                    }
                }
            };

            TestService.prototype.initUser = function () {
                var loginUser = this.storage.getLoginUser();
                if (loginUser) {
                    this.rest.restangularizeElement(null, loginUser, "users", {});

                    this.loginUser = loginUser;
                }
            };

            TestService.prototype.fetchMarkForUser = function () {
                var defer = this.q.defer();

                if (this.loginUser) {
                    var res = this.loginUser;
                    var param = {};

                    res.getList('marks', param).then(function (marks) {
                        defer.resolve(marks);
                    }, function (err) {
                        defer.reject(err);
                    });
                } else {
                    defer.reject();
                }
                return defer.promise;
            };

            TestService.prototype.initAllQuestions = function () {
                var _this = this;
                this.question_infos = {};

                var questionLastUpdate = this.storage.getQuestionLastUpdate();

                if (!questionLastUpdate) {
                    this.logger.debug("No locally stored question, loading all question from server");
                    return this.retrieveQuestions(false);
                } else {
                    this.logger.debug("question last update :" + questionLastUpdate);

                    var s = '2014-06-05T17:00:00.033Z';
                    if (questionLastUpdate.toISOString() < s) {
                        this.logger.debug("Locally stored questions need to be expired for date:" + s);
                        return this.retrieveQuestions(false);
                    }

                    var questions;
                    try  {
                        questions = this.storage.getQuestions();

                        if (questions && _.isArray(questions)) {
                            this.logger.debug("Found locally stored questions: " + questions.length);
                            _(questions).each(function (q) {
                                _this.rest.restangularizeElement(null, q, "questions", {});
                                _this.updateQuestionInfoWithQuestion(q);
                            });
                        } else {
                            this.logger.debug("Locally stored questions canot be restored. need to force an update!");
                            return this.retrieveQuestions(false);
                        }

                        this.logger.debug("Loading updated question from server.");
                        return this.retrieveQuestions(true);
                    } catch (err) {
                        this.logger.debug("Error while loading question from from local storage, it will be cleaned.");
                        return this.retrieveQuestions(false);
                    }
                }
                ;
            };

            TestService.prototype.saveQuestionToLocalStorage = function () {
                var allQuestion = this.getAllQuestion();
                if (allQuestion.length > 0) {
                    this.storage.saveQuestions(allQuestion);
                    this.logger.debug("Question has been stored in localstorage: " + allQuestion.length);
                } else {
                    this.logger.debug("No question to be stored");
                }
            };

            TestService.prototype.updateQuestionInfoWithQuestion = function (q) {
                if (q.deleted === true) {
                    delete this.question_infos[q._id];
                    this.logger.debug("Question is deleted: " + q._id);
                } else {
                    var questionVM = new model.QuestionVM(q);
                    this.transformQuestion(questionVM);

                    questionVM.answers = _(questionVM.answers).shuffle();

                    var questionInfo2 = this.question_infos[q._id];
                    if (questionInfo2) {
                        questionInfo2.question = questionVM;
                    } else {
                        var questionInfo = new service.QuestionInfo(questionVM);
                        this.question_infos[q._id] = questionInfo;
                    }
                }
            };

            TestService.prototype.resetQuestionFromServer = function () {
                var _this = this;
                this.retrieveQuestions(false, function (nu) {
                    _this.displayMessage("Initialization of Question Done! Total Question: " + nu, 'info', 1000);
                    _this.restoreSessionMarks();
                });
            };

            TestService.prototype.retrieveQuestions = function (last_update, callback, numberOfQuestions, skip) {
                var _this = this;
                var param = { compress: 1 };
                if (last_update) {
                    var lastUpdate = this.storage.getQuestionLastUpdate();
                    if (lastUpdate) {
                        param = _.extend(param, { last_update: lastUpdate.getTime() });
                        this.logger.debug(lastUpdate);
                    }
                }

                if (numberOfQuestions) {
                    param = _.extend(param, { limit: numberOfQuestions });

                    if (skip) {
                        param = _.extend(param, { skip: skip });
                    }
                }

                this.logger.debug("To load new questions with parameters: " + JSON.stringify(param));

                return this.questionRest.getList(param).then(function (qs) {
                    _this.logger.debug("Questions retrieved from backend: " + qs.length);

                    var count = 0;
                    _(qs).each(function (q) {
                        var qsCompress = q.questions;
                        var s = LZString.decompressFromBase64(qsCompress);
                        var qsArray = JSON.parse(s);
                        _(qsArray).each(function (q1) {
                            count++;
                            _this.updateQuestionInfoWithQuestion(q1);
                        });
                    });

                    _this.storage.setQuestionLastUpdate();

                    if (count > 0) {
                        _this.saveQuestionToLocalStorage();
                    }

                    if (callback) {
                        callback(count);
                    }
                }, function (failMsg) {
                    _this.logger.debug("Request questions from server failed: " + JSON.stringify(failMsg));

                    if (callback) {
                        callback(0);
                    }
                });
            };

            TestService.prototype.getAllQuestionVMs = function (sort) {
                var filterQuestionVM = this.filterQuestionVM();

                if (filterQuestionVM === null)
                    return null;
                if (sort === true) {
                    return _(filterQuestionVM).sortBy(this.calculateScoreForQuestion, this);
                } else {
                    return filterQuestionVM;
                }
            };

            TestService.prototype.getAllQuestion = function () {
                var result = [];
                _(this.question_infos).each(function (value, key, obj) {
                    var q = value;
                    if (q && q.question && q.question.question) {
                        result.push(q.question.question);
                    }
                });
                return result;
            };

            TestService.prototype.isLogin = function () {
                return this.loginUser !== undefined && this.loginUser !== null;
            };

            TestService.prototype.login_user = function (user, loadMark) {
                this.logger.debug("user login" + user.username);
                this.loginUser = user;
                this.storage.saveLoginUser(user);

                if (loadMark === true) {
                    this.initMarks();
                }
            };

            TestService.prototype.logout_user = function () {
                this.loginUser = null;
                this.storage.removeLoginUser();
            };

            TestService.prototype.transformQuestion = function (q) {
                if (q.question.type === model.QuestionType[0 /* yes_or_no */]) {
                    q.answers = [];

                    var ans = new model.Answer();
                    ans.text = 'True';
                    ans.right = q.question.answer;
                    q.answers.push(new model.AnswerVM(ans));

                    var ans2 = new model.Answer();
                    ans2.text = 'False';
                    ans2.right = !q.question.answer;
                    q.answers.push(new model.AnswerVM(ans2));
                }
            };

            TestService.prototype.getQuestionsForReview = function () {
                var questionToReview = this.storage.getQuestionToReview();
                return this.filterQuestionVM(function (q) {
                    if (q.to_review === true)
                        return true;
                    else {
                        q.to_review = (questionToReview.indexOf(q.question._id) >= 0);
                        return q.to_review;
                    }
                });
            };

            TestService.prototype.getQuestionByTag = function (tag) {
                return this.filterQuestionVM(function (q) {
                    return _(q.tags).any(function (t) {
                        return t.selected && t.tag === tag;
                    });
                });
            };

            TestService.prototype.searchQuestions = function (text) {
                return this.filterQuestionVM(function (q) {
                    var questionMatch = (q.question.question && q.question.question.toLowerCase().indexOf(text.toLowerCase()) > -1);
                    var answerMatch = false;

                    if (q.question.answers) {
                        answerMatch = _(q.question.answers).some(function (a) {
                            return a.text.toLowerCase().indexOf(text.toLowerCase()) > -1;
                        });
                    }

                    return questionMatch || answerMatch;
                });
            };

            TestService.prototype.filterQuestionVM = function (predict) {
                if (!_.isEmpty(this.question_infos)) {
                    var result = [];
                    _(this.question_infos).each(function (value, key, obj) {
                        var q = value;
                        if (q && q.question && (predict === undefined || predict(q.question))) {
                            result.push(q.question);
                        }
                    });
                    return result;
                } else {
                    this.logger.debug("Empty Question list, looks like the Initialization is not done yet.");
                    return null;
                }
            };

            TestService.prototype.filterMark = function (predict) {
                var result = [];
                _(this.question_infos).each(function (value, key, obj) {
                    var q = value;
                    if (q && q.mark && (predict === undefined || predict(q.mark))) {
                        result.push(q.mark);
                    }
                });
                return result;
            };

            TestService.prototype.getSessionAllMarks = function () {
                var _this = this;
                return this.filterMark(function (m) {
                    return m.last_update > _this.storage.getSessionStart();
                });
            };

            TestService.prototype.getQuestionsToBrowseByType = function (type) {
                var _this = this;
                if (type === 'session-all') {
                    return this.retrieveQuestionsByMarks(function (m) {
                        return m.last_update > _this.storage.getSessionStart();
                    });
                }
                ;

                if (type === 'session-wrong') {
                    return this.retrieveQuestionsByMarks(function (m) {
                        return m.last_update > _this.storage.getSessionStart() && m.lastMarkedWrong();
                    });
                }
                ;

                if (type === 'session-right') {
                    return this.retrieveQuestionsByMarks(function (m) {
                        return m.last_update > _this.storage.getSessionStart() && m.lastMarkedRight();
                    });
                }
                ;

                if (type === 'session-flag') {
                    return this.retrieveQuestionsByMarks(function (m) {
                        return m.last_update > _this.storage.getSessionStart() && m.flag;
                    });
                }

                if (type === 'session-review') {
                    return this.retrieveQuestionsByMarks(function (m) {
                        return m.last_update > _this.storage.getSessionStart() && (m.flag || m.lastMarkedWrong());
                    });
                }
                ;

                if (type === 'user-flag') {
                    return this.retrieveQuestionsByMarks(function (m) {
                        return m.flag;
                    });
                }
                ;

                if (type === 'user-review') {
                    return this.retrieveQuestionsByMarks(function (m) {
                        return m.flag || m.lastMarkedWrong();
                    });
                }
                ;

                if (type === 'user-been_wrong') {
                    return this.retrieveQuestionsByMarks(function (m) {
                        return m.beenAnsweredWrong();
                    });
                }
                ;

                if (type === 'user-not-answered') {
                    return this.retrieveQuestionsByMarks(function (m) {
                        return !m.lastMarkedRight() && !m.lastMarkedWrong();
                    });
                }
                ;

                if (type === 'user-difficult') {
                    return this.retrieveQuestionsByMarks(function (m) {
                        return m.isDifficult();
                    });
                }
                ;

                if (type === 'user-right') {
                    return this.retrieveQuestionsByMarks(function (m) {
                        return m.lastMarkedRight();
                    });
                }
                ;

                if (type === 'user-wrong') {
                    return this.retrieveQuestionsByMarks(function (m) {
                        return m.lastMarkedWrong();
                    });
                }
                ;

                return [];
            };

            TestService.prototype.retrieveQuestionsByMarks = function (markFilter) {
                var _this = this;
                var filterMark = this.filterMark(markFilter);
                return _(filterMark).map(function (m) {
                    return _this.question_infos[m.question_id].question;
                });
            };

            TestService.prototype.findQuestionById = function (id) {
                return this.filterQuestionVM(function (q) {
                    return q.question._id === id;
                });
            };

            TestService.prototype.findQuestionByIds = function (ids) {
                return this.filterQuestionVM(function (q) {
                    return ids.indexOf(q.question._id) >= 0;
                    ;
                });
            };

            TestService.prototype.getLoginUser = function () {
                return this.loginUser;
            };

            TestService.prototype.calculateScoreForQuestion = function (q) {
                var questionInfo = this.question_infos[q.question._id];
                var number2 = this.random();
                return questionInfo.mark.score() + number2;
            };

            TestService.prototype.random = function () {
                var u1 = Math.random();
                var u2 = Math.random();
                var normal = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
                return normal;
            };

            TestService.prototype.sendingMark = function (callback) {
                var _this = this;
                if (this.isLogin()) {
                    var uid = this.loginUser._id;

                    var marked = this.filterMark(function (m) {
                        return (m.last_update && (m.last_update > _this.storage.getMarkLastSend()));
                    });

                    if (marked.length > 0) {
                        this.logger.debug("Send marks to server: " + marked.length);
                        var res = this.loginUser;
                        res.post("marks", marked).then(function (succ) {
                            _this.logger.debug("post marks for user success.");
                            _this.storage.setMarkLastSend();
                            if (callback)
                                callback(marked.length);
                        });
                    } else {
                        if (callback)
                            callback(marked.length);
                        this.logger.debug("no new marks to save.");
                    }
                } else {
                    this.logger.debug("No login, marks is not send");
                }
            };

            TestService.prototype.markQuestion = function (q, right) {
                if (!q.answered)
                    return;

                if (this.question_infos[q.question._id]) {
                    var theMark = this.question_infos[q.question._id].mark;
                    if (right === true) {
                        theMark.right(this.storage.getSessionStart());
                    } else if (right === false) {
                        theMark.wrong(this.storage.getSessionStart());
                    }
                }
            };

            TestService.prototype.flagQuestion = function (q, flag) {
                if (this.question_infos[q.question._id]) {
                    var theMark = this.question_infos[q.question._id].mark;

                    theMark.doFlag(flag);
                }
            };

            TestService.prototype.reportQuestion = function (q, type, callback) {
                var qm = q.question;
                qm.customPUT({ type: model.ReportType[type] }, "report", {}, {}).then(function (succ) {
                    if (callback)
                        callback(true, succ);
                }, function (err) {
                    if (callback)
                        callback(false, err);
                });
            };

            TestService.prototype.tagQuestion = function (tag, q, callback) {
                var _this = this;
                if (this.isLogin()) {
                    this.logger.debug("To tag the question " + q.question._id + " with tag : " + tag);
                    var qm = q.question;
                    qm.customPUT({ tag: tag }, "tag", { user_id: this.loginUser._id }, {}).then(function (succ) {
                        _this.logger.debug("tag success");
                        if (callback)
                            callback(true, succ);
                    }, function (err) {
                        _this.logger.debug("tag fail");
                        if (callback)
                            callback(false, JSON.stringify(err));
                    });
                } else {
                    callback(false, "Not Login");
                }
            };

            TestService.prototype.saveQuestion = function (q, callback) {
                var _this = this;
                if (this.isLogin()) {
                    var qm = q.question;
                    qm.save({ user_id: this.loginUser._id }).then(function (succ) {
                        callback(true);
                    }, function (fail_msg) {
                        _this.logger.warn("Saving Question fail_msg", JSON.stringify(fail_msg));
                        callback(false, fail_msg);
                    });
                } else {
                    callback(false, "Not Login");
                }
            };

            TestService.prototype.createQuestion = function (q, callback) {
                var _this = this;
                if (this.isLogin()) {
                    this.questionRest.post(q, { user_id: this.loginUser._id }).then(function (savedQuestion) {
                        _this.logger.info("Question Saved");
                        _this.updateQuestionInfoWithQuestion(savedQuestion);
                        callback(true);
                    }, function (fail_msg) {
                        _this.logger.warn("Saving Question fail_msg", JSON.stringify(fail_msg));
                        callback(false, fail_msg);
                    });
                } else {
                    callback(false, "Not Login");
                }
            };

            TestService.prototype.deleteQuestion = function (q, callback) {
                var _this = this;
                if (this.isLogin()) {
                    var qm = q.question;
                    qm.deleted = true;
                    qm.save({ user_id: this.loginUser._id }).then(function (succ) {
                        delete _this.question_infos[q.question._id];
                        callback(true);
                    }, function (fail_msg) {
                        _this.logger.warn("Deleting Question fail_msg: ", JSON.stringify(fail_msg));
                        callback(false, fail_msg);
                    });
                } else {
                    callback(false, "Not Login");
                }
            };

            TestService.prototype.signUp = function (email, password, callback) {
                var _this = this;
                this.userRest.post({
                    username: email,
                    password: password
                }).then(function (result) {
                    _this.logger.debug("user signup successful: " + result.username);
                    callback(result);
                }, function (err) {
                    _this.logger.debug("user signup failed with message: " + (err || ""));
                    callback(null);
                });
            };

            TestService.prototype.login = function (email, password, callback) {
                var _this = this;
                this.userRest.customPOST({ email: email, password: password }, 'login').then(function (result) {
                    _this.logger.debug("user login successful: " + result.username);
                    callback(result);
                }, function (error) {
                    _this.logger.debug("user login failed with message: " + (error || ""));
                    callback(null);
                });
            };

            TestService.prototype.checkUsername = function (username, callback) {
                this.userRest.customGET('check', { email: username }).then(function (result) {
                    if (result === 'true') {
                        callback(true);
                    } else {
                        callback(false);
                    }
                }, function (error) {
                });
            };

            TestService.prototype.saveSessionMarks = function () {
                var sessionStart = this.storage.getSessionStart();
                var filterMark = this.filterMark(function (m) {
                    return (m.last_update) && m.last_update > sessionStart;
                });
                this.storage.saveSessionMarks(filterMark);
                this.logger.debug("Marks saved for the session: " + filterMark ? filterMark.length : 0);
            };

            TestService.prototype.restoreSessionMarks = function () {
                var _this = this;
                var sessionMarks = this.storage.getSessionMarks();
                _(sessionMarks).each(function (m) {
                    _this.updateQuestionInfoWithMark(m);
                });
                this.logger.debug("Restore Marks from Session: " + sessionMarks ? sessionMarks.length : 0);
            };

            TestService.prototype.updateSessionInfo = function () {
                var sessionInfo = this.sessionInfo;
                sessionInfo.session_start = this.storage.getSessionStart();

                var sessionMarks = this.filterMark(function (m) {
                    return m.last_update && m.last_update > sessionInfo.session_start;
                });

                sessionInfo.session_question_total = sessionMarks.length;
                var flag = 0;
                var countBy = _(sessionMarks).countBy(function (m) {
                    if (m.flag)
                        flag++;

                    if (m.lastMarkedRight())
                        return 'right';
                    if (m.lastMarkedWrong())
                        return 'wrong';
                    return 'flag_no_answer';
                });

                sessionInfo.session_question_answered = (countBy.right || 0) + (countBy.wrong || 0);
                sessionInfo.session_question_right = (countBy.right) || 0;
                sessionInfo.session_question_wrong = (countBy.wrong) || 0;
                sessionInfo.session_question_flagged_no_answer = countBy.flag_no_answer || 0;

                sessionInfo.session_question_flagged = flag;
                sessionInfo.session_question_to_review = this.storage.getQuestionToReview().length;
                sessionInfo.right_percent = (sessionInfo.session_question_answered === 0 ? 0 : (sessionInfo.session_question_right / sessionInfo.session_question_answered)) * 100;

                return sessionInfo;
            };

            TestService.prototype.retrieveSessionInfo = function () {
                this.updateSessionInfo();

                return this.sessionInfo;
            };

            TestService.prototype.getBrowseBufferedQuestions = function () {
                var _this = this;
                return;
                _(this.buffer_for_browse_id).map(function (qid) {
                    return _this.question_infos[qid].question;
                });
            };

            TestService.prototype.setBrowseBufferedQuestions = function (ids) {
                this.buffer_for_browse_id = ids;
            };

            TestService.prototype.retrieveUserProgress = function () {
                this.updateUserInfo();
                return this.userInfo;
            };

            TestService.prototype.updateUserInfo = function () {
                if (!this.isLogin())
                    return;

                var userProgress = this.userInfo;

                var marks = this.filterMark(function (m) {
                    return true;
                });
                userProgress.total_questions = marks.length;

                var flag = 0;
                var review = 0;
                var difficult = 0;
                var beenWrong = 0;
                var countBy = _(marks).countBy(function (m) {
                    var to_review = false;
                    var result = 'no_answered';

                    if (m.isDifficult()) {
                        difficult++;
                    }
                    if (m.beenAnsweredWrong()) {
                        beenWrong++;
                    }

                    if (m.flag) {
                        flag++;
                        to_review = true;
                    }

                    if (m.lastMarkedRight()) {
                        result = 'right';
                    } else if (m.lastMarkedWrong()) {
                        to_review = true;
                        result = 'wrong';
                    }
                    ;

                    if (to_review)
                        review++;

                    return result;
                });

                userProgress.total_practised = (countBy.right || 0 + countBy.wrong || 0);
                userProgress.total_flag = flag;
                userProgress.total_right = (countBy.right) || 0;
                userProgress.total_wrong = (countBy.wrong) || 0;
                userProgress.total_remain = (countBy.no_answered) || 0;

                userProgress.all_to_review = review;
                userProgress.total_difficult = difficult;
                userProgress.total_been_wrong = beenWrong;

                userProgress.right_percent = (userProgress.total_right / userProgress.total_questions) * 100;
                userProgress.wrong_percent = (userProgress.total_wrong / userProgress.total_questions) * 100;
                userProgress.all_percent = ((userProgress.total_right + userProgress.total_wrong) / userProgress.total_questions) * 100;

                return userProgress;
            };
            TestService.$inject = [
                '$rootScope', 'Restangular', '$log', '$interval', '$q', '$window', '$modal'
            ];
            return TestService;
        })();
        service.TestService = TestService;
    })(service || (service = {}));
    
    return service;
});
//# sourceMappingURL=service.js.map
