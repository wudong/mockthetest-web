module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-requirejs');

    grunt.initConfig({

    bower: {
        install: {
           //just run 'grunt bower:install' and you'll see files from your Bower packages in lib directory
        }
      },

      typescript: {
            base: {
              src: ['app/**/*.ts', 'main.ts', 'config-require.ts'],
              dest: 'dist/build',
              options: {
                module: 'amd', //or commonjs
                target: 'es5', //or es3
                sourceMap: true,
                declaration: false
              }
            }
          },

      watch: {
            files: ['app/*.ts', 'main.ts', 'config-require.ts'],
            tasks: ['typescript']
        },

      requirejs: {
        compile: {
          options: {
              paths: {
                  'almond'            : '../../bower_components/almond/almond',
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
                  'amplify'         : '../../bower_components/amplify/lib/amplify',
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
              },

              baseUrl : "./dist/build",
              name: "main",
              out: "./dist/main.js",
              removeCombined: true,
              findNestedDependencies: true,
              optimize: "uglify2",
              wrap: true,

              uglify2: {
                  output: {
                      beautify: false
                  },
                  compress: {
                      sequences: false,
                      global_defs: {
                          DEBUG: false
                      }
                  },
                  warnings: true,
                  mangle: true
              }
          }
        }
      }
    });

    grunt.registerTask("default", ["typescript"]);
    grunt.registerTask("distribute", ["typescript", "requirejs"]);
}
