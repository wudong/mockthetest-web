define(["require", "exports"], function(require, exports) {
    var question;
    (function (question) {
        var QuestionTextFilter = (function () {
            function QuestionTextFilter() {
            }
            QuestionTextFilter.question_two_mark_important = function (text) {
                var index = text.indexOf("TWO");
                var index2 = text.indexOf("NOT");

                if (index >= 0) {
                    var result = text.substring(0, index) + "<span class='text-warning'>TWO</span>" + text.substring(index + 3);
                    return result;
                } else if (index2 >= 0) {
                    var result = text.substring(0, index2) + "<span class='text-warning'>NOT</span>" + text.substring(index2 + 3);
                    return result;
                } else {
                    return text;
                }
            };
            return QuestionTextFilter;
        })();
        question.QuestionTextFilter = QuestionTextFilter;
    })(question || (question = {}));
    
    return question;
});
//# sourceMappingURL=questiontextfilter.js.map
