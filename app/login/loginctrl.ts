/// <reference path="../../__all.d.ts" />

import model=require('app/model');
import service=require('app/service');

module login
{
    export class UserLoginController {
        scope:IUserLoginScope;
        modal:ng.ui.bootstrap.IModalServiceInstance;
        testService: service.TestService;


        public static $inject = [
            '$scope',  '$modalInstance', 'testService', 'showLoginPage'
        ];

        constructor($scope:IUserLoginScope, $modalInstance:ng.ui.bootstrap.IModalServiceInstance,
                    testService:service.TestService,
                    showLoginPage:boolean) {
            this.scope = $scope;
            this.scope.vm = this;
            this.testService = testService;
            this.scope.loginPage = showLoginPage;

            this.modal = $modalInstance;

            //this is important.
            //see the http://stackoverflow.com/questions/17606936/angularjs-dot-in-ng-userModel
            //the scope in the login form page is actually a child scope of this form.
            this.scope.form = <ILoginForm>{
                wrong_pass: false,
                user_existed: false
            };

            
        }

        public signUp() {

            if (this.scope.form.name_taken || this.scope.form.password_not_match){
                this.scope.form.error_msg="Invalid input, please check.";
                return;
            }

            this.testService.signUp(
                this.scope.form.email, this.scope.form.password, (succ: any)=>{
                if (succ){
                    this.modal.close(succ);
                }else{
                    this.scope.form.error_msg = "Sign up Error, please try again.";
                }
            });
        }

        public login(){
            this.testService.login(this.scope.form.email, this.scope.form.password,
                (succ:any)=>{
                    if (succ){
                        this.modal.close(succ);
                    }else{
                        this.scope.form.error_msg = "Password and email address do not match!";
                    }
                })
        }

        public inValidateSignup(): boolean{
            return
                (this.scope.form.name_taken || this.scope.form.password_not_match || this.scope.form.error_msg || !this.scope.form.password);
        }

        public checkUsername(username:string) {
            if (!username) {
                this.scope.form.name_taken = false;
                return;
            }

            this.testService.checkUsername(username, (succ: boolean)=>{
                this.scope.form.name_taken = !succ;
            });
        }

        public checkPassword(pass:string) {
            if (this.scope.form.password !== pass) {
                this.scope.form.password_not_match = true;
            } else {
                this.scope.form.password_not_match = false;
            }
        }
    }

    export interface IUserLoginScope extends ng.IScope {
        vm: UserLoginController;
        form: ILoginForm;
        loginPage: boolean;
    }

    export interface ILoginForm {
        email: string;
        password: string;

        wrong_pass: boolean;
        user_existed: boolean;

        password_2: string;
        rememberme:boolean;

        name_taken: boolean;
        password_not_match: boolean;
        error_msg: string;
    }
}

export=login;