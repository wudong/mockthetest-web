define(["require", "exports", 'app/model'], function(require, exports, model) {
    var storage;
    (function (_storage) {
        'use strict';

        var StorageService = (function () {
            function StorageService() {
                this.sessionStorage = amplify.store.sessionStorage;
                this.localStorage = amplify.store.localStorage;
            }
            StorageService.prototype.saveQuestions = function (questions) {
                var s = JSON.stringify(questions);
                var s2 = LZString.compressToBase64(s);
                this.localStorage("questions", s2);
            };

            StorageService.prototype.getUserPromotionDone = function () {
                var any = this.localStorage("user_promotion");
                if (any === true)
                    return true;
                else
                    return false;
            };

            StorageService.prototype.setUserPromotionDone = function (done) {
                if (done) {
                    this.localStorage("user_promotion", done);
                } else
                    this.localStorage("user_promotion", true);
            };

            StorageService.prototype.getQuestions = function () {
                var ss = this.localStorage("questions");
                if (!ss)
                    return [];
                var s2 = LZString.decompressFromBase64(ss);
                return JSON.parse(s2);
            };

            StorageService.prototype.getQuestionLastUpdate = function () {
                var time = this.localStorage("question_last_update");
                return this.getDate(this.localStorage, "question_last_update");
            };

            StorageService.prototype.setQuestionLastUpdate = function () {
                this.setDate(this.localStorage, "question_last_update");
            };

            StorageService.prototype.saveLoginUser = function (user) {
                this.localStorage("login_user", user);
            };

            StorageService.prototype.getLoginUser = function () {
                var uu = this.localStorage("login_user");
                if (uu) {
                    return _.extend(new model.User(), uu);
                } else {
                    return null;
                }
            };

            StorageService.prototype.removeLoginUser = function () {
                this.localStorage("login_user", null);
            };

            StorageService.prototype.saveSessionMarks = function (marks) {
                this.sessionStorage("session_marks", marks);
            };

            StorageService.prototype.getSessionMarks = function () {
                return this.getSessionArray("session_marks");
            };

            StorageService.prototype.setSessionStart = function () {
                if (!this.sessionStorage("session_start")) {
                    this.setDate(this.sessionStorage, "session_start");
                }
            };

            StorageService.prototype.getMarkLastSend = function () {
                return this.getDate(this.sessionStorage, "mark_last_send");
            };

            StorageService.prototype.setMarkLastSend = function () {
                this.setDate(this.sessionStorage, "mark_last_send");
            };

            StorageService.prototype.getSessionStart = function () {
                return this.getDate(this.sessionStorage, "session_start");
            };

            StorageService.prototype.addQuestionToReview = function (qid) {
                this.addToSessionArray(qid, "session_question_to_review");
            };

            StorageService.prototype.removeQuestionFromReview = function (qid) {
                this.removeFromSessionArray(qid, "session_question_to_review");
            };

            StorageService.prototype.getQuestionToReview = function () {
                return this.getSessionArray("session_question_to_review");
            };

            StorageService.prototype.addRecentSearch = function (qid) {
                this.addToSessionArray(qid, "session_recent_search");
            };

            StorageService.prototype.removeRecentSearch = function (qid) {
                this.removeFromSessionArray(qid, "session_recent_search");
            };

            StorageService.prototype.getRecentSearches = function () {
                return this.getSessionArray("session_recent_search");
            };

            StorageService.prototype.addToSessionArray = function (qid, key) {
                var qs = this.sessionStorage(key);
                var ss = _.isArray(qs) ? qs : [];
                if (ss.indexOf(qid) <= 0) {
                    ss.push(qid);
                    this.sessionStorage(key, ss);
                }
            };

            StorageService.prototype.removeFromSessionArray = function (qid, key) {
                var qs = this.sessionStorage(key);
                var ss = _.isArray(qs) ? qs : [];
                var ind = ss.indexOf(qid);
                if (ind > 0) {
                    ss.splice(ind, 1);
                    this.sessionStorage(key, ss);
                }
            };

            StorageService.prototype.getSessionArray = function (key) {
                var qs = this.sessionStorage(key);
                var ss = _.isArray(qs) ? qs : [];
                return ss;
            };

            StorageService.prototype.getDate = function (storage, key) {
                var time = storage(key);
                if (time)
                    return new Date(time);
                else
                    return null;
            };

            StorageService.prototype.setDate = function (storage, key, date) {
                storage(key, (date || new Date()).getTime());
            };
            return StorageService;
        })();
        _storage.StorageService = StorageService;
    })(storage || (storage = {}));

    
    return storage;
});
//# sourceMappingURL=storage.js.map
