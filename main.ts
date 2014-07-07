/// <reference path="__all.d.ts" />
require(['./config-require'], function ( config) {
    // update global require config
    require.config(config);
    // load app
    require(['angular', 'domReady!','app/testApp', 'jquery-mobile', 'angular-ui-router',
            'restangular', 'underscore','angular-timer', 'lz-string', 'amplify',
            'angulartics-ga-cordova'],
    function(angular, dom, main){
        main.config(angular);
        angular.bootstrap(dom, ['testMobileApp']);

    });
});
