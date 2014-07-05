/// <reference path="../../__all.d.ts" />
import service = require('app/service');
import model = require('app/model');
declare module info {
    class InfoController {
        public scope: IInfoPageScope;
        public testService: service.TestService;
        public logger: ng.ILogService;
        public location: ng.ILocationService;
        static $inject: string[];
        constructor($scope: IInfoPageScope, $log: ng.ILogService, $location: ng.ILocationService, testService: service.TestService);
        public toggle_info(): void;
        public uploadMarks(): void;
        public reset(): void;
        public refreshContent(target?: string): void;
        public isLogin(): boolean;
        public show_session_all(): void;
    }
    interface IInfoPageScope extends ng.IScope {
        vm: InfoController;
        show_info: boolean;
        user: model.UserProgress;
        session: model.SessionInfo;
    }
}
export = info;
