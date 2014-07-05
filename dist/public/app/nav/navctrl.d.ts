/// <reference path="../../__all.d.ts" />
import service = require('app/service');
declare module nav {
    class NavigationController {
        public scope: INavigationScope;
        public logger: ng.ILogService;
        public modal: ng.ui.bootstrap.IModalService;
        public testService: service.TestService;
        public timeout: ng.ITimeoutService;
        static $inject: string[];
        constructor($scope: INavigationScope, $log: ng.ILogService, $modal: ng.ui.bootstrap.IModalService, testService: service.TestService, $timeout: ng.ITimeoutService);
        public toggleInfo(): void;
        public showLoginPop(loginPage: boolean): void;
        public signOut(): void;
    }
    interface INavigationScope extends ng.IScope {
        login: boolean;
        userName: string;
        vm: NavigationController;
        message: string;
        message_type: string;
    }
}
export = nav;
