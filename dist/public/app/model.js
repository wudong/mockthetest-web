var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports"], function(require, exports) {
    var model;
    (function (model) {
        'use strict';

        var ModelClass = (function () {
            function ModelClass() {
            }
            return ModelClass;
        })();
        model.ModelClass = ModelClass;

        var all_tags = null;
        function getAllTags() {
            if (!all_tags) {
                var all_tags = [];
                for (var n in Tag) {
                    if (typeof Tag[n] === 'number')
                        all_tags.push(n);
                }
            }
            return all_tags;
        }

        var Constance = (function () {
            function Constance() {
            }
            Constance.Number_Of_Question = 24;
            Constance.Passing_Rate = 0.75;
            Constance.EventType_EditQuestion = 'EType_edit_question';
            return Constance;
        })();
        model.Constance = Constance;

        (function (MODE) {
            MODE[MODE["practise"] = 0] = "practise";
            MODE[MODE["test"] = 1] = "test";
            MODE[MODE["review"] = 2] = "review";
        })(model.MODE || (model.MODE = {}));
        var MODE = model.MODE;

        (function (Tag) {
            Tag[Tag["history"] = 0] = "history";
            Tag[Tag["culture"] = 1] = "culture";
            Tag[Tag["government"] = 2] = "government";
            Tag[Tag["society"] = 3] = "society";
            Tag[Tag["law"] = 4] = "law";
            Tag[Tag["real_test_question"] = 5] = "real_test_question";
        })(model.Tag || (model.Tag = {}));
        var Tag = model.Tag;

        (function (ReportType) {
            ReportType[ReportType["duplicate"] = 0] = "duplicate";
            ReportType[ReportType["wrong"] = 1] = "wrong";
            ReportType[ReportType["format"] = 2] = "format";
        })(model.ReportType || (model.ReportType = {}));
        var ReportType = model.ReportType;

        (function (QuestionType) {
            QuestionType[QuestionType["yes_or_no"] = 0] = "yes_or_no";
            QuestionType[QuestionType["right_or_wrong"] = 1] = "right_or_wrong";
            QuestionType[QuestionType["single"] = 2] = "single";
            QuestionType[QuestionType["multi"] = 3] = "multi";
        })(model.QuestionType || (model.QuestionType = {}));
        var QuestionType = model.QuestionType;

        var Question = (function (_super) {
            __extends(Question, _super);
            function Question() {
                _super.apply(this, arguments);
                this.answers = [];
                this.tags = [];
            }
            return Question;
        })(ModelClass);
        model.Question = Question;

        var Answer = (function () {
            function Answer() {
            }
            return Answer;
        })();
        model.Answer = Answer;

        var Mark = (function (_super) {
            __extends(Mark, _super);
            function Mark() {
                _super.apply(this, arguments);
                this.last_update = null;
                this.flag = false;
            }
            Mark.prototype.updateFrom = function (m) {
                this.question_id = m.question_id;
                this.user_id = m.user_id;
                this.last_update = _.isString(m.last_update) ? (new Date(m.last_update)) : m.last_update;
                this.flag = m.flag;
                if (m.answered_right) {
                    this.answered_right = _.clone(m.answered_right);
                    this.answered_right.last_update = _.isString(m.answered_right.last_update) ? (new Date(m.answered_right.last_update)) : m.answered_right.last_update;
                    this.answered_right.previous_update = _.isString(m.answered_right.previous_update) ? (new Date(m.answered_right.previous_update)) : m.answered_right.previous_update;
                }
                if (m.answered_wrong) {
                    this.answered_wrong = _.clone(m.answered_wrong);
                    this.answered_wrong.last_update = _.isString(m.answered_wrong.last_update) ? (new Date(m.answered_wrong.last_update)) : m.answered_wrong.last_update;
                    this.answered_wrong.previous_update = _.isString(m.answered_wrong.previous_update) ? (new Date(m.answered_wrong.previous_update)) : m.answered_wrong.previous_update;
                }
            };

            Mark.prototype.beenAnsweredWrong = function () {
                return (this.answered_wrong) && this.answered_wrong.repeat > 0;
            };

            Mark.prototype.lastMarkedRight = function () {
                if (this.answered_right) {
                    return (!this.answered_wrong || (this.answered_right.last_update > this.answered_wrong.last_update));
                }
                return false;
            };

            Mark.prototype.lastMarkedWrong = function () {
                if (this.answered_wrong) {
                    return (!this.answered_right || (this.answered_wrong.last_update > this.answered_right.last_update));
                }
                return false;
            };

            Mark.prototype._do_mark = function (prop, prop_oppo, sessionStart) {
                if (!this[prop] || this[prop].last_update < sessionStart) {
                    if (!this[prop])
                        this[prop] = new MarkRecord();

                    this[prop].increase();
                    this.last_update = this[prop].last_update;

                    if (this[prop_oppo] && this[prop_oppo].last_update > sessionStart) {
                        this[prop_oppo].restore();
                        if (this[prop_oppo].repeat === 0)
                            this[prop_oppo] = null;
                    }
                }
            };

            Mark.prototype.doFlag = function (f) {
                if (f === this.flag)
                    return;
                else {
                    this.flag = f;
                    this.last_update = new Date();
                }
            };

            Mark.prototype.right = function (sessionStart) {
                this._do_mark('answered_right', 'answered_wrong', sessionStart);
            };

            Mark.prototype.wrong = function (sessionStart) {
                this._do_mark('answered_wrong', 'answered_right', sessionStart);
            };

            Mark.prototype.isDifficult = function () {
                return (this.answered_wrong) && this.answered_wrong.repeat > 2 && (!this.answered_right || this.answered_right.repeat <= this.answered_wrong.repeat);
            };

            Mark.prototype.score = function () {
                var weight_for_no_mark = 9;
                var weight_for_mark_right = -1;
                var weight_for_mark_wrong = 3;

                if (this.last_update === null)
                    return weight_for_no_mark;
                else {
                    var score = 0;

                    if (this.answered_right) {
                        score += weight_for_mark_right * this.answered_right.repeat;
                    }
                    if (this.answered_wrong) {
                        score += weight_for_mark_wrong * this.answered_wrong.repeat;
                    }
                    return score;
                }
            };
            return Mark;
        })(ModelClass);
        model.Mark = Mark;

        var MarkRecord = (function () {
            function MarkRecord() {
                this.repeat = 0;
            }
            MarkRecord.prototype.increase = function () {
                this.repeat++;
                this.previous_update = this.last_update;
                this.last_update = new Date();
            };

            MarkRecord.prototype.restore = function () {
                if (this.repeat > 0) {
                    this.repeat--;
                    this.last_update = this.previous_update;
                }
            };
            return MarkRecord;
        })();
        model.MarkRecord = MarkRecord;

        var User = (function (_super) {
            __extends(User, _super);
            function User() {
                _super.apply(this, arguments);
            }
            return User;
        })(ModelClass);
        model.User = User;

        var TagVM = (function () {
            function TagVM() {
            }
            return TagVM;
        })();
        model.TagVM = TagVM;

        var QuestionVM = (function () {
            function QuestionVM(q) {
                var _this = this;
                this.answers = [];
                this.tags = [];
                this.answerClicked = function (ans) {
                    var countBy = 0;

                    _(_this.answers).each(function (a) {
                        if (a.selected)
                            countBy++;
                    });

                    if (_this.question.type !== 'multi') {
                        if (ans.selected === true)
                            return;
                        else {
                            ans.selected = true;
                            _this.answers.forEach(function (a) {
                                if (a !== ans) {
                                    a.selected = false;
                                }
                            });
                        }
                    } else if (_this.question.type === 'multi') {
                        if (countBy < 2) {
                            ans.selected = !ans.selected;
                            if (ans.selected) {
                                countBy += 1;
                            } else {
                                countBy -= 1;
                            }
                        } else if (countBy === 2) {
                            if (ans.selected) {
                                ans.selected = false;
                                countBy -= 1;
                            }
                        }
                    }

                    if (_this.question.type !== 'multi' || ((countBy) === 2)) {
                        _this.answered = true;
                        if (_this.questionAnsweredCorrectly()) {
                            _this.success = true;
                            _this.not_success = false;
                            _this.to_review = false;
                        } else {
                            _this.not_success = true;
                            _this.success = false;
                            _this.to_review = true;
                        }
                    }
                };
                this.question = q;
                _(this.question.answers).each(function (a) {
                    _this.answers.push(new AnswerVM(a));
                });

                var alltags = getAllTags();
                _(alltags).each(function (s) {
                    var tagVM = new TagVM();
                    tagVM.tag = s;
                    tagVM.selected = (q.tags && q.tags.indexOf(s) >= 0);
                    _this.tags.push(tagVM);
                });
            }
            QuestionVM.prototype.questionAnsweredCorrectly = function () {
                return _(this.answers).every(function (a) {
                    return (a.selected && a.answer.right) || (!a.answer.right && !a.selected);
                });
            };

            QuestionVM.prototype.reset = function () {
                delete this.success;
                delete this.not_success;
                delete this.current;
                delete this.explained;

                _(this.answers).each(function (aa) {
                    aa.selected = false;
                });
            };
            return QuestionVM;
        })();
        model.QuestionVM = QuestionVM;

        var AnswerVM = (function () {
            function AnswerVM(a) {
                this.answer = a;
            }
            return AnswerVM;
        })();
        model.AnswerVM = AnswerVM;

        var SessionInfo = (function () {
            function SessionInfo() {
            }
            return SessionInfo;
        })();
        model.SessionInfo = SessionInfo;

        var UserProgress = (function () {
            function UserProgress() {
            }
            return UserProgress;
        })();
        model.UserProgress = UserProgress;
    })(model || (model = {}));
    
    return model;
});
//# sourceMappingURL=model.js.map
