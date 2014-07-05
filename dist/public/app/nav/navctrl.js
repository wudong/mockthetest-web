define(["require", "exports", 'app/login/loginctrl'], function(require, exports, login) {
    var nav;
    (function (nav) {
        var NavigationController = (function () {
            function NavigationController($scope, $log, $modal, testService, $timeout) {
                this.scope = $scope;
                this.scope.vm = this;
                this.logger = $log;
                this.modal = $modal;
                this.timeout = $timeout;

                this.testService = testService;

                if (this.testService.isLogin()) {
                    this.scope.login = true;
                    this.scope.userName = this.testService.getLoginUser().username;
                } else {
                    this.scope.login = false;
                    this.scope.userName = "";
                }
                this.scope.message = null;
            }
            NavigationController.prototype.toggleInfo = function () {
                if (this.testService.mainControl)
                    this.testService.mainControl.toggleInfo();
            };

            NavigationController.prototype.showLoginPop = function (loginPage) {
                var _this = this;
                var setting = {
                    templateUrl: '/app/login/login.html',
                    controller: login.UserLoginController,
                    resolve: {
                        rest: [
                            'Restangular',
                            function (rest) {
                                return rest;
                            }],
                        showLoginPage: function () {
                            return loginPage;
                        }
                    }
                };

                this.modal.open(setting).result.then(function (user) {
                    if (user !== null) {
                        _this.scope.login = true;
                        _this.scope.userName = user.username;
                        _this.testService.login_user(user, true);
                        _this.logger.debug("user is login with username: " + user.username);
                    }
                });
            };

            NavigationController.prototype.signOut = function () {
                this.scope.login = false;
                this.scope.userName = "";
                this.testService.logout_user();
            };
            NavigationController.$inject = [
                '$scope', '$log', '$modal', 'testService', '$timeout'
            ];
            return NavigationController;
        })();
        nav.NavigationController = NavigationController;
    })(nav || (nav = {}));
    
    return nav;
});
//# sourceMappingURL=navctrl.js.map
