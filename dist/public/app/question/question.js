define(["require", "exports"], function(require, exports) {
    var question;
    (function (_question) {
        'use strict';

        var QuestionDirective = (function () {
            function QuestionDirective() {
                this.templateUrl = "app/question/question.html";
                this.restrict = 'E';
                this.scope = {
                    question: '=',
                    mode: "@mode",
                    listener: '='
                };
            }
            QuestionDirective.prototype.link = function ($scope, element, attrs) {
                $scope.answerClicked = function (ans, question) {
                    question.answerClicked(ans);
                    if ($scope.listener) {
                        var callback = $scope.listener;
                        callback.answerClicked(question);
                    }
                };
                $scope.explain_collapse = true;
                $scope.toggle_explain = function () {
                    $scope.explain_collapse = !$scope.explain_collapse;
                };

                $scope.tagQuestion = function (tag, question) {
                    if ($scope.listener) {
                        var callback = $scope.listener;
                        callback.tagQuestion(tag, question);
                    }
                };
            };
            return QuestionDirective;
        })();
        _question.QuestionDirective = QuestionDirective;

        function directive() {
            return new QuestionDirective();
        }
        _question.directive = directive;
    })(question || (question = {}));

    
    return question;
});
//# sourceMappingURL=question.js.map
