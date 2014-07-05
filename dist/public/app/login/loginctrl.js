define(["require", "exports"], function(require, exports) {
    var login;
    (function (login) {
        var UserLoginController = (function () {
            function UserLoginController($scope, $modalInstance, testService, showLoginPage) {
                this.scope = $scope;
                this.scope.vm = this;
                this.testService = testService;
                this.scope.loginPage = showLoginPage;

                this.modal = $modalInstance;

                this.scope.form = {
                    wrong_pass: false,
                    user_existed: false
                };
            }
            UserLoginController.prototype.signUp = function () {
                var _this = this;
                if (this.scope.form.name_taken || this.scope.form.password_not_match) {
                    this.scope.form.error_msg = "Invalid input, please check.";
                    return;
                }

                this.testService.signUp(this.scope.form.email, this.scope.form.password, function (succ) {
                    if (succ) {
                        _this.modal.close(succ);
                    } else {
                        _this.scope.form.error_msg = "Sign up Error, please try again.";
                    }
                });
            };

            UserLoginController.prototype.login = function () {
                var _this = this;
                this.testService.login(this.scope.form.email, this.scope.form.password, function (succ) {
                    if (succ) {
                        _this.modal.close(succ);
                    } else {
                        _this.scope.form.error_msg = "Password and email address do not match!";
                    }
                });
            };

            UserLoginController.prototype.inValidateSignup = function () {
                return;
                (this.scope.form.name_taken || this.scope.form.password_not_match || this.scope.form.error_msg || !this.scope.form.password);
            };

            UserLoginController.prototype.checkUsername = function (username) {
                var _this = this;
                if (!username) {
                    this.scope.form.name_taken = false;
                    return;
                }

                this.testService.checkUsername(username, function (succ) {
                    _this.scope.form.name_taken = !succ;
                });
            };

            UserLoginController.prototype.checkPassword = function (pass) {
                if (this.scope.form.password !== pass) {
                    this.scope.form.password_not_match = true;
                } else {
                    this.scope.form.password_not_match = false;
                }
            };
            UserLoginController.$inject = [
                '$scope', '$modalInstance', 'testService', 'showLoginPage'
            ];
            return UserLoginController;
        })();
        login.UserLoginController = UserLoginController;
    })(login || (login = {}));

    
    return login;
});
//# sourceMappingURL=loginctrl.js.map
