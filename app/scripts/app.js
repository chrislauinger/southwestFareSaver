'use strict';

angular.module('southwestFareSaverApp', ['ui.router','ngResource','n3-line-chart','frapontillo.bootstrap-switch', 'ngSanitize'])
.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
            .state('app', {
                url:'/',
                views: {
                    'header': {
                        templateUrl : 'app/views/header_alt.html',
                    },
                    'content': {
                        templateUrl : 'app/views/home_alt.html'
                    }
                }

            })
            .state('app.aboutus', {
                url:'aboutus',
                views: {
                    'content@': {
                        templateUrl : 'app/views/aboutus.html'                
                    }
                }
            })
            .state('app.refund', {
                url:'refund',
                views: {
                    'content@': {
                        templateUrl : 'app/views/refund.html'                 
                    }
                }
            })
            .state('app.checkin', {
                url: 'checkin',
                views: {
                    'content@': {
                        templateUrl : 'app/views/checkin.html'
                    }
                }
            });
            $urlRouterProvider.otherwise('/');
        })
;