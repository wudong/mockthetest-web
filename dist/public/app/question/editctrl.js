define(["require", "exports", 'app/model'], function(require, exports, model) {
    var question;
    (function (_question) {
        var QuestionEditController = (function () {
            function QuestionEditController($scope, $modalInstance, question) {
                this.scope = $scope;
                this.scope.vm = this;
                this.modal = $modalInstance;
                this.scope.question = question.question;
                this.questionVM = question;
                this.scope.form = { new_answer_text: "", new_answer_right: false, newQuestion: false };
            }
            QuestionEditController.prototype.save = function () {
                if (this.scope.question._id) {
                    this.modal.close('save');
                } else {
                    this.modal.close({
                        operation: 'create',
                        question: this.scope.question
                    });
                }
            };

            QuestionEditController.prototype.delete = function () {
                this.modal.close('delete');
            };

            QuestionEditController.prototype.cancel = function () {
                this.modal.dismiss();
            };

            QuestionEditController.prototype.create = function () {
                this.scope.form.newQuestion = true;
                var qq = new model.Question();
                qq.type = 'single';

                this.scope.question = qq;
                this.questionVM = null;
            };

            QuestionEditController.prototype.addAnswer = function () {
                var a = new model.Answer();
                a.right = this.scope.form.new_answer_right;
                a.text = this.scope.form.new_answer_text;

                this.scope.question.answers.push(a);

                if (this.questionVM !== null) {
                    this.questionVM.answers.push(new model.AnswerVM(a));
                }

                this.scope.form.new_answer_text = "";
                this.scope.form.new_answer_right = false;
            };

            QuestionEditController.prototype.tagClicked = function () {
            };

            QuestionEditController.prototype.removeAnswer = function (a) {
                this.scope.question.answers = _(this.scope.question.answers).without(a);

                if (this.questionVM !== null) {
                    var toRemove = _(this.questionVM.answers).find(function (aa) {
                        return aa.answer === a;
                    });

                    if (toRemove) {
                        this.questionVM.answers = _(this.questionVM.answers).without(toRemove);
                    }
                }
            };
            QuestionEditController.$inject = [
                '$scope', '$modalInstance', 'question'
            ];
            return QuestionEditController;
        })();
        _question.QuestionEditController = QuestionEditController;
    })(question || (question = {}));
    
    return question;
});
//# sourceMappingURL=editctrl.js.map
