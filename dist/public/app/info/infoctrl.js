define(["require", "exports"], function(require, exports) {
    var info;
    (function (info) {
        var InfoController = (function () {
            function InfoController($scope, $log, $location, testService) {
                this.testService = testService;
                this.logger = $log;
                this.location = $location;
                this.scope = $scope;
                this.scope.vm = this;

                this.scope.show_info = false;
                this.scope.session = this.testService.retrieveSessionInfo();
                this.scope.user = this.testService.retrieveUserProgress();
            }
            InfoController.prototype.toggle_info = function () {
                this.scope.show_info = !this.scope.show_info;
            };

            InfoController.prototype.uploadMarks = function () {
                var _this = this;
                this.testService.sendingMark(function (n) {
                    _this.testService.displayMessage("practise results has been saved: " + n);
                });
            };

            InfoController.prototype.reset = function () {
                this.testService.resetQuestionFromServer();
                this.location.url(this.location.url());
            };

            InfoController.prototype.refreshContent = function (target) {
                if (!target || target === 'session') {
                    this.testService.updateSessionInfo();
                }

                if (!target || target === 'user') {
                    this.testService.updateUserInfo();
                }
            };

            InfoController.prototype.isLogin = function () {
                return this.testService.isLogin();
            };

            InfoController.prototype.show_session_all = function () {
                var sessionAllMarks = this.testService.getSessionAllMarks();
                var map = _(sessionAllMarks).map(function (m) {
                    return m.question_id;
                });

                this.testService.setBrowseBufferedQuestions(map);
                this.location.path("browse").search("buf");
            };
            InfoController.$inject = [
                '$scope', '$log', '$location', 'testService'
            ];
            return InfoController;
        })();
        info.InfoController = InfoController;
    })(info || (info = {}));

    
    return info;
});
//# sourceMappingURL=infoctrl.js.map
