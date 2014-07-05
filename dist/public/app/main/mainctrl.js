define(["require", "exports"], function(require, exports) {
    var main;
    (function (main) {
        var MainController = (function () {
            function MainController($scope, $log, $location, $analytics, $document, testService) {
                var _this = this;
                this.scope = $scope;
                this.scope.vm = this;
                this.analytics = $analytics;
                this.loc = $location;
                this.logger = $log;
                this.scope.show_intro = true;

                testService.mainControl = this;
                this.scope.seo = testService.getSEOObject();

                this.scope.$on('$routeChangeSuccess', function () {
                    var path = _this.loc.path();
                    if (path === '/') {
                        _this.scope.seo.reset();
                        _this.scope.show_intro = true;
                    } else {
                        _this.scope.show_intro = false;
                    }
                });

                this.scope.$watch("seo.getTitle()", function () {
                    _this.logger.debug("title  need change to: " + _this.scope.seo.getTitle());
                    _this.logger.debug("current title: " + $document[0].title);
                    ($document[0]).title = _this.scope.seo.getTitle();
                });
            }
            MainController.prototype.setShowIntro = function (show) {
                this.scope.show_intro = show;
            };
            MainController.$inject = [
                '$scope', '$log', '$location', '$analytics', '$document', 'testService'
            ];
            return MainController;
        })();
        main.MainController = MainController;
    })(main || (main = {}));

    
    return main;
});
//# sourceMappingURL=mainctrl.js.map
