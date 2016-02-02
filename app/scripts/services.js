'use strict';

angular.module('southwestFareSaverApp')
        .constant("baseURL","http://localhost:3000/")
        .constant('AUTH_EVENTS', {
          loginSuccess: 'auth-login-success',
          loginFailed: 'auth-login-failed',
          logoutSuccess: 'auth-logout-success',
          sessionTimeout: 'auth-session-timeout',
          notAuthenticated: 'auth-not-authenticated',
          notAuthorized: 'auth-not-authorized'
        })


              .service('menuFactory', ['$resource', 'baseURL', function($resource,baseURL) {
               this.getDishes = function(){
                                        return $resource(baseURL+"dishes/:id",null,  {'update':{method:'PUT' }});
                                    };

                this.getPromotions = function(){
                  return $resource(baseURL+"promotions/:id",null,  {'update':{method:'PUT' }});
                };
                        
        }])

        .factory('corporateFactory',  ['$resource', 'baseURL', function($resource,baseURL) {
    
            var corpfac = {};

            corpfac.getLeaders = function(){
              return $resource(baseURL+"leadership/:id",null,  {'update':{method:'PUT' }});
            };

            return corpfac;
    
        }])

            .service('feedbackFactory',  ['$resource', 'baseURL', function($resource,baseURL) {
    
            this.getFeedback = function(){
              return $resource(baseURL+"feedback/:id",null,  {'update':{method:'PUT' }});
            };

    
        }])

            .service('userService', [ function() {

              this.getItem = function(username){  
                var table = new AWS.DynamoDB({params: {TableName: 'users'}});
                return table.getItem({Key : {'username':  { S : String(username)}}})
              };
              this.setUser = function(registerInfo){
                var table = new AWS.DynamoDB({params: {TableName: 'users'}});
                return table.putItem({Item : getUserItem(registerInfo),
                                      Expected: {'username': { Exists: false }}
                          });
              }
        }])

              .service('userFlightService', [ function() {

              this.addFlight = function(flightInfo, username){
                var table = new AWS.DynamoDB({params: {TableName: 'userFlights'}});
                return table.putItem({Item : getUserFlightItem(flightInfo, username)});
              }
              this.getFlights = function(username){  
                var table = new AWS.DynamoDB({params: {TableName: 'userFlights'}});
                return table.query({KeyConditions: { 
                                      'username' : {
                                        ComparisonOperator : 'EQ',
                                        AttributeValueList : [{'S' : String(username)}]
                                      }}});
              }
        }])

             .service('fareService', [ function() {



              this.getFares = function(flight){  
                var table = new AWS.DynamoDB({params: {TableName: 'fares'}});
                return table.query({KeyConditions: { 
                                      'route' : {
                                        ComparisonOperator : 'EQ',
                                        AttributeValueList : [{'S' : String(flight.route)}]
                                      }}});
              }
        }])
        ;