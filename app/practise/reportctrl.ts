/// <reference path="../../__all.d.ts" />

import model = require('app/model');

module report
{
    export class ResultReportController {
        scope:IReportScope;

        public static $inject = [
            '$scope',  'result'
        ];

        constructor($scope:IReportScope,
                    result:IResultForReport) {
            this.scope = $scope;
            this.scope.result = result;
            this.scope.vm = this;

            this.fill_result(this.scope.result);
            this.scope.result.mode = result.mode;
        }

        private fill_result(result:IResultForReport) {
            result.total = result.right + result.wrong;
            result.rate = (result.right / result.total ) * 100;
            result.passed = result.rate >= model.Constance.Passing_Rate * 100;
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