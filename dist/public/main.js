require(['./config-require'], function (config) {
    require.config(config);

    require([
        'angular', 'domReady!',
        'app/testApp', 'restangular', 'underscore', 'angular-cookies',
        'angular-route', 'angular-sanitize',
        'angular-timer', 'angular-storage', 'angular-ui-bootstrap', 'angular-promise-tracker',
        'angulartics', 'angulartics-ga', 'lz-string', 'amplify', 'bootstrap-growl'], function (angular, dom, main) {
        main.config(angular);
        angular.bootstrap(dom, ['testApp']);
    });
});
//# sourceMappingURL=main.js.map
