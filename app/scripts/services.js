'use strict';

angular.module('southwestFareSaverApp')

         .factory('dataFactory', [ function() {
          var data = {};

          data.currentUser = null;

          data.setCurrentUser = function(user){
            data.currentUser = user;
          }

          data.getCurrentUser = function(){
            return data.currentUser;
          }

            data.userFlights = [];

                data.addUserFlight = function(flight){
                  data.userFlights.push(flight);
                }

                data.resetUserFlights = function(){
                  data.userFlights = [];
                }

                data.getUserFlights = function(){
                  return data.userFlights;
                }

          return data;
         }])

            .service('userService', [ function() {

              this.getItem = function(username){  
                var table = new AWS.DynamoDB({params: {TableName: 'users'}});
                return table.getItem({Key : {'username':  { S : String(username)}}})
              };
              this.putUser = function(registerInfo){
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



              this.getFares = function(userFlight){  
                var table = new AWS.DynamoDB({params: {TableName: 'fares'}});
                var flightKeyExpression = '#flightKey = :keyVal';
                return table.query({FilterExpression: flightKeyExpression,
                                   ExpressionAttributeValues : {':keyVal' : { 'S' : String(userFlight.flightKey)}},
                                   ExpressionAttributeNames : {'#flightKey' : 'flight_key'},
                                      KeyConditions: {
                                       'route' : {
                                        ComparisonOperator : 'EQ',
                                        AttributeValueList : [{'S' : String(userFlight.route)}]
                                      }
                                    }
                                });
              }
        }])
        ;