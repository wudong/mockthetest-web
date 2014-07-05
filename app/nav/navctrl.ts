/// <reference path="../../__all.d.ts" />

import login= require('app/login/loginctrl');
import model=require ('app/model');
import service=require('app/service');

module nav {
    export class NavigationController {
        scope:INavigationScope;
        logger:ng.ILogService;
        modal:ng.ui.bootstrap.IModalService;
        testService:service.TestService;
        timeout: ng.ITimeoutService;

        public static $inject = [
            '$scope', '$log' , '$modal', 'testService', '$timeout'
        ];

        constructor($scope:INavigationScope, $log:ng.ILogService,
                    $modal:ng.ui.bootstrap.IModalService, testService:service.TestService,
                    $timeout:ng.ITimeoutService) {
            this.scope = $scope;
            this.scope.vm = this;
            this.logger = $log;
            this.modal = $modal;
            this.timeout = $timeout;

            this.testService = testService;
//            this.testService.setMessageDeliver(this);

            if (this.testService.isLogin()) {
                this.scope.login = true;
                this.scope.userName = this.testService.getLoginUser().username;
            } else {
                this.scope.login = false;
                this.scope.userName = "";
            }
            this.scope.message=null;
        }
//
//        public displayMessage(message: string, type?: string,
//            autoDismissTime?: number): void {
//            this.scope.message=message;
//            this.scope.message_type= type;
//
//            var timeTocancel = autoDismissTime || 5000;
//
//            if (message !== null) {
//                this.timeout(()=> {
//                    this.scope.message = null;
//                }, timeTocancel);
//            }
//        }

        public toggleInfo(){
            if (this.testService.mainControl)
                this.testService.mainControl.toggleInfo();
        }

        public showLoginPop(loginPage:boolean) {
            //show the login/signup pop.
            var setting:ng.ui.bootstrap.IModalSettings = {
                templateUrl: '/app/login/login.html',
                controller: login.UserLoginController,

                //to inject this into the controller as parameter rest.
                resolve: {
                    rest: ['Restangular',
                        function (rest) {
                            return rest
                        }],
                    //note how this is resolved
                    showLoginPage: () => {
                        return loginPage;
                    }
                }
            };

            this.modal.open(setting).result.
                then((user:model.User)=> {
                    //the cookie is set by the server side.
                    if (user!==null){
                        this.scope.login = true;
                        this.scope.userName = user.username;
                        this.testService.login_user(user, true);
                        this.logger.debug("user is login with username: "+user.username);
                    }
                });
        }

        public showHelpPop(){
            //show the help pop.
            var setting:ng.ui.bootstrap.IModalSettings = {
                templateUrl: '/app/help/help.html'
            };

            this.modal.open(setting);
        }

        public signOut() {
            this.scope.login = false;
            this.scope.userName = "";
            this.testService.logout_user();
        }
    }

    export interface INavigationScope extends ng.IScope {
        login: boolean;
        userName: string;
        vm: NavigationController;
        message: string;
        message_type: string;
    }
}
export=nav;
