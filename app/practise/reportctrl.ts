/// <reference path="../../__all.d.ts" />

import model = require('app/model');

module report
{
    export class ResultReportController {
        scope:IReportScope;
        modal:ng.ui.bootstrap.IModalServiceInstance;

        public static $inject = [
            '$scope', '$modalInstance', 'result'
        ];

        constructor($scope:IReportScope, $modalInstance:ng.ui.bootstrap.IModalServiceInstance,
                    result:IResultForReport) {
            this.scope = $scope;
            this.scope.result = result;
            this.modal = $modalInstance;
            this.scope.vm = this;

            this.fill_result(this.scope.result);
            this.scope.result.mode = result.mode;
        }

        private fill_result(result:IResultForReport) {
            result.total = result.right + result.wrong;
            result.rate = (result.right / result.total ) * 100;
            result.passed = result.rate >= model.Constance.Passing_Rate * 100;
        }

        public review(){
            this.modal.close('review');
        }

        public take_another_test(){
            this.modal.close('another');
        }

        public dismiss(){
            this.modal.dismiss();
        }

    }

    export interface IReportScope extends ng.IScope {
        vm: ResultReportController;
        result: IResultForReport;
    }

    export interface IResultForReport {
        //current mode.
        mode: string;

        passed: boolean;
        total: number;
        rate: number;
        right: number;
        wrong: number;
        time_used: number;
    }
}

export=report;