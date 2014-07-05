/// <reference path="../../__all.d.ts" />
declare module report {
    class ResultReportController {
        public scope: IReportScope;
        public modal: ng.ui.bootstrap.IModalServiceInstance;
        static $inject: string[];
        constructor($scope: IReportScope, $modalInstance: ng.ui.bootstrap.IModalServiceInstance, result: IResultForReport);
        private fill_result(result);
        public review(): void;
        public take_another_test(): void;
        public dismiss(): void;
    }
    interface IReportScope extends ng.IScope {
        vm: ResultReportController;
        result: IResultForReport;
    }
    interface IResultForReport {
        mode: string;
        passed: boolean;
        total: number;
        rate: number;
        right: number;
        wrong: number;
        time_used: number;
    }
}
export = report;
