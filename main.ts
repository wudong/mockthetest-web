/// <reference path="__all.d.ts" />
require(['./config-require'], function ( config) {
    // update global require config
    require.config(config);
    // load app
    require(['angular', 'domReady!',
            'app/testApp', 'restangular', 'underscore', 'angular-cookies',
            'angular-route','angular-sanitize',
            'angular-timer', 'angular-storage', 'angular-ui-bootstrap', 'angular-promise-tracker',
            'angulartics', 'angulartics-ga', 'lz-string', 'amplify', 'bootstrap-growl'],
    function(angular, dom, main){
        main.config(angular);
        angular.bootstrap(dom, ['testApp']);
    });
});
