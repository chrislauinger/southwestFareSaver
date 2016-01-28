'use strict';

angular.module('southwestFareSaverApp', ['ui.router','ngResource'])
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
        
            .state('app.track', {
                url:'track',
                views: {
                    'content@': {
                        templateUrl : 'views/track.html',
                        controller  : 'TrackController'                  
                    }
                }
            })

            .state('app.search', {
                url: 'search',
                views: {
                    'content@': {
                        templateUrl : 'views/search.html',
                        controller  : 'MenuController'
                    }
                }
            })

            .state('app.checkin', {
                url: 'checkin',
                views: {
                    'content@': {
                        templateUrl : 'views/checkin.html',
                        controller  : 'MenuController'
                   }
                }
            });
    
        $urlRouterProvider.otherwise('/');
    })
;