define(["require", "exports", 'app/model'], function(require, exports, model) {
    var report;
    (function (report) {
        var ResultReportController = (function () {
            function ResultReportController($scope, $modalInstance, result) {
                this.scope = $scope;
                this.scope.result = result;
                this.modal = $modalInstance;
                this.scope.vm = this;

                this.fill_result(this.scope.result);
                this.scope.result.mode = result.mode;
            }
            ResultReportController.prototype.fill_result = function (result) {
                result.total = result.right + result.wrong;
                result.rate = (result.right / result.total) * 100;
                result.passed = result.rate >= model.Constance.Passing_Rate * 100;
            };

            ResultReportController.prototype.review = function () {
                this.modal.close('review');
            };

            ResultReportController.prototype.take_another_test = function () {
                this.modal.close('another');
            };

            ResultReportController.prototype.dismiss = function () {
                this.modal.dismiss();
            };
            ResultReportController.$inject = [
                '$scope', '$modalInstance', 'result'
            ];
            return ResultReportController;
        })();
        report.ResultReportController = ResultReportController;
    })(report || (report = {}));

    
    return report;
});
//# sourceMappingURL=reportctrl.js.map
