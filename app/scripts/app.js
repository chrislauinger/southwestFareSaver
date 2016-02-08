'use strict';

angular.module('southwestFareSaverApp', ['ui.router','ngResource','n3-line-chart'])
.config(function($stateProvider, $urlRouterProvider) {
        $stateProvider
        
            // route for the home page
            .state('app', {
                url:'/',
                views: {
                    'header': {
                        templateUrl : 'views/header.html',
                    },
                    'content': {
                        templateUrl : 'views/home.html'
                    }
                }

            })
        
            .state('app.aboutus', {
                url:'aboutus',
                views: {
                    'content@': {
                        templateUrl : 'views/aboutus.html'                
                    }
                }
            })
        
            .state('app.refund', {
                url:'refund',
                views: {
                    'content@': {
                        templateUrl : 'views/refund.html'                 
                    }
                }
            })

            .state('app.search', {
                url: 'search',
                views: {
                    'content@': {
                        templateUrl : 'views/search.html'
                    }
                }
            })

            .state('app.checkin', {
                url: 'checkin',
                views: {
                    'content@': {
                        templateUrl : 'views/checkin.html'
                   }
                }
            });
    
        $urlRouterProvider.otherwise('/');
    })
;