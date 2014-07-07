/// <reference path="__all.d.ts" />

define({
    baseUrl: "./dist/build",
    paths: {
        'angular'           : '../../bower_components/angular/angular',
        'angular-cookies'   : '../../bower_components/angular-cookies/angular-cookies',
        'angular-route'     : '../../bower_components/angular-route/angular-route',
        'angular-sanitize'   : '../../bower_components/angular-sanitize/angular-sanitize',
        'angular-timer'     : '../../bower_components/angular-timer/dist/angular-timer',
        'angular-promise-tracker'     : '../../bower_components/angular-promise-tracker/promise-tracker',
        "angular-ui-router":          '../../bower_components/angular-ui-router/release/angular-ui-router',
        'restangular'         : '../../bower_components/restangular/dist/restangular',
        'angulartics'         : '../../bower_components/angulartics/src/angulartics',
        'angulartics-ga-cordova'         : '../../bower_components/angulartics/src/angulartics-ga-cordova',
        'jquery'            : '../../bower_components/jquery/jquery',
        'jquery-mobile'            : '../../bower_components/jquery-mobile-bower/js/jquery.mobile-1.4.2',
        'domReady'          : '../../bower_components/requirejs-domready/domReady',
        'underscore'        : '../../bower_components/underscore/underscore',
        'lz-string'         : '../../bower_components/lz-string/libs/lz-string-1.3.3-min',
        'amplify'           : '../../bower_components/amplify/lib/amplify'
    },

    shim: {
        'angular': {
            'exports': 'angular',
            'deps': ['jquery']
        },

        'angular-cookies': ['angular'],
        'angular-route': ['angular'],
        'angular-timer': ['angular'],
        'angular-ui-router': ['angular'],
        'restangular': ['angular'],
        'angular-promise-tracker': ['angular'],
        'angular-sanitize': ['angular'],
        'angulartics': ['angular'],
        'angulartics-ga-cordova': ['angulartics'],

        'underscore' : {
            'exports': '_'
        },

        'amplify': {
            'deps': ['jquery'],
            'exports': 'amplify'
        },

        'jquery-mobile': ['jquery'],

        'jquery'     : {
            'export': '$'
        }
    }
});
