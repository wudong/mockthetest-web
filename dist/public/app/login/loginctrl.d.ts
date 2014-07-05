/// <reference path="../../__all.d.ts" />
import service = require('app/service');
declare module login {
    class UserLoginController {
        public scope: IUserLoginScope;
        public modal: ng.ui.bootstrap.IModalServiceInstance;
        public testService: service.TestService;
        static $inject: string[];
        constructor($scope: IUserLoginScope, $modalInstance: ng.ui.bootstrap.IModalServiceInstance, testService: service.TestService, showLoginPage: boolean);
        public signUp(): void;
        public login(): void;
        public inValidateSignup(): boolean;
        public checkUsername(username: string): void;
        public checkPassword(pass: string): void;
    }
    interface IUserLoginScope extends ng.IScope {
        vm: UserLoginController;
        form: ILoginForm;
        loginPage: boolean;
    }
    interface ILoginForm {
        email: string;
        password: string;
        wrong_pass: boolean;
        user_existed: boolean;
        password_2: string;
        rememberme: boolean;
        name_taken: boolean;
        password_not_match: boolean;
        error_msg: string;
    }
}
export = login;
