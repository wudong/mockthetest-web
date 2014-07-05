/// <reference path="__all.d.ts" />

define({
    baseUrl: "./dist/public",
    paths: {
        'angular'           : '../../bower_components/angular/angular',
        'angular-cookies'   : '../../bower_components/angular-cookies/angular-cookies',
        'angular-route'     : '../../bower_components/angular-route/angular-route',
        'angular-sanitize'   : '../../bower_components/angular-sanitize/angular-sanitize',
        'angular-timer'     : '../../bower_components/angular-timer/dist/angular-timer',
        'angular-promise-tracker'     : '../../bower_components/angular-promise-tracker/promise-tracker',
        'restangular'         : '../../bower_components/restangular/dist/restangular',
        'angulartics'         : '../../bower_components/angulartics/src/angulartics',
        'angulartics-ga'         : '../../bower_components/angulartics/src/angulartics-ga',
        'angular-ui-bootstrap' : '../../bower_components/angular-ui-bootstrap-bower/ui-bootstrap-tpls' ,
        'angular-storage'   : '../../bower_components/ngstorage/ngStorage',
        'bootstrap'         : '../../bower_components/bootstrap/dist/js/bootstrap',
        'jquery'            : '../../bower_components/jquery/dist/jquery',
        'domReady'          : '../../bower_components/requirejs-domready/domReady',
        'underscore'        : '../../bower_components/underscore/underscore',
        'lz-string'         : '../../bower_components/lz-string/libs/lz-string-1.3.3-min',
        'amplify'           : '../../bower_components/amplify/lib/amplify',
        'bootstrap-growl'   : '../../bower_components/bootstrap-growl/jquery.bootstrap-growl'
        },

    shim: {
        'angular': {
            'exports': 'angular'
        },
        'angular-cookies': ['angular'],
        'angular-route': ['angular'],
        'angular-timer': ['angular'],
        'angular-storage': ['angular'],
        'restangular': ['angular'],
        'angular-promise-tracker': ['angular'],
        'angular-ui-bootstrap': ['angular', 'bootstrap'],
        'angular-sanitize': ['angular'],
        'angulartics': ['angular'],
        'angulartics-ga': ['angulartics'],

        'underscore' : {
            'exports': '_'
        },

        'amplify': {
            'deps': ['jquery'],
            'exports': 'amplify'
        },

        'bootstrap-growl' : ['bootstrap'],

        'bootstrap'  : ['jquery'],
        'jquery'     : {
            'export': '$'
        }
    }
});
