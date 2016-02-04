'use strict';

angular.module('southwestFareSaverApp')

    .controller('PlotController', ['$scope', 'userFlightService',function($scope, userFlightService) {


          $scope.options = {
            series: [
              {
                axis: "y",
                dataset : "dataset0",
                key: "currentPrice",
                label: "Market",
                color: "#1f77b4",
                type: ['line','dot'],
                id: 'mySeries0'
              },
             {
                axis: "y",
                dataset: "dataset0",
                key: "cost",
                label: "Purchase",
                color: "#00ff00",
                type: ['line'],
                id: 'mySeries1'
              },

            ],
            axes: {x: {key: "date", type : "date"}}
          };
 
}]) 

        .controller('TrackController', ['$scope', 'userFlightService', 'fareService', function($scope, userFlightService, fareService) {
            $scope.flightInfo = {origin : "", destination : "", date : "", flightNumber: "", cost : "", usingPoints : false};
            
            //TODO: verify flight is real?, 
            $scope.submitFlight = function(){
                //check origin
                if (!validAirportCode($scope.flightInfo.origin)){ console.log("invalid origin")};
                if (!validAirportCode($scope.flightInfo.destination)){ console.log("invalid destination")};

                userFlightService.addFlight($scope.flightInfo, $scope.currentUser.username)
                 .on('success', function(response) {

                    }).
                    on('error', function(response) {
                       console.log('fail add flight');
                       console.log(response);
                    }).
                    on('complete', function(response) {
                        $scope.clearForm();
                        $scope.$apply();
                        $scope.updateFlightDisplay();
                    }).send();
                
            }

            $scope.addFaresToUserFlights = function(){
                $scope.userFlights.forEach(function(flight, i){
                    fareService.getFares(flight)
                    .on('success', function(response){
                        if (response.data.Items.length == 0){
                            console.log("Did not find any fares")
                        }
                        for (var j = 0; j < response.data.Items.length; j++){
                                var fareValidityDate = parseInt(response.data.Items[j].fare_validity_date.N);
                                var currentPrice = flight.usingPoints ?  parseInt(response.data.Items[j].points.N) : parseInt(response.data.Items[j].price.N);
                                var fareItem = { 'date' : new Date(fareValidityDate), 'currentPrice' : currentPrice, 'cost' : flight.cost};
                                flight.fareHistory.push(fareItem);
                                if (j === (response.data.Items.length-1)){
                                    if (fareItem.currentPrice >= fareItem.cost){
                                        flight.refundStr = "No Refund Currently";
                                    }
                                    else {
                                        flight.refundStr = "Refund Found! " + "Rebook on southwest.com for a refund of " + (fareItem.cost - fareItem.currentPrice).toString();
                                    }
                                }
                        }
                        flight.fareHistory = {dataset0 : flight.fareHistory};
                        if (i === ($scope.userFlights.length-1)){ //signal last fare pushed, ready to plots
                            $scope.setPlotsReady(true);
                            $scope.$apply();
                            console.log($scope.userFlights)
                        }
                        //check for refunds? setup plots? 
                    }).
                    on('error', function(response) {
                       console.log('fail get fares');
                       console.log(response);
                    }).send();

                })
            }

            $scope.updateFlightDisplay = function(){

                 userFlightService.getFlights($scope.currentUser.username)
                 .on('success', function(response) {
                        if (response.data.Items.length != $scope.userFlights.length){
                            $scope.resetUserFlights();
                            for (var i = 0; i < response.data.Items.length; i++){
                                $scope.addUserFlight(new UserFlight(response.data.Items[i]));
                            }
                        }
                    }).
                    on('error', function(response) {
                       console.log('fail get flight');
                       console.log(response);
                    }).
                    on('complete', function(response) {
                        $scope.$apply();
                        $scope.addFaresToUserFlights();
                    }).send();
            }



            $scope.clearForm = function(){
                $scope.flightInfo = {origin : "", destination : "", date : "", flightNumber: "", cost : "", usingPoints : false};
            }

        }])
        .controller('TabController', ['$scope', function($scope) {
            
            $scope.tab = 1;
        
            $scope.select = function(setTab) {
                $scope.tab = setTab;
            };

            $scope.isSelected = function(setTab){
                if (setTab == $scope.tab){
                    return true;
                }
                else{
                    return false;
                }
            }

        }])

        .controller('RegisterController', ['$scope', 'userService', function($scope,userService) {
            //check for dup username
            $scope.registerInfo = {username:"", firstName:"", lastName:"", email:"" };
            $scope.registerMessage = "";
            $scope.takenUsername = "chrislauinger"; //just 
            $scope.registerUser = function (){
                $scope.registerMessage = "Loading ...";

                    userService.setUser($scope.registerInfo).
                    on('success', function(response) {
                        $scope.setCurrentUser($scope.registerInfo);
                    }).
                    on('error', function(response) {
                        if (response.message === "The conditional request failed"){ //username already exists
                            $scope.registerMessage = "username already exists: " + $scope.registerInfo.username;
                            $scope.takenUsername = $scope.registerInfo.username;
                        }
                        else{
                            $scope.registerMessage = response;
                        }
                    }).
                    on('complete', function(response) {
                        $scope.$apply();
                    }).send();

                
            }

            $scope.clearForm = function(){
                $scope.registerInfo = {username:"", firstName:"", lastName:"", email:"" };
            }

            $scope.$watch('registerInfo.username', function (newValue, oldValue) {
                if (newValue != $scope.takenUsername){
                    $scope.registerMessage = "";
                }
                if (newValue == $scope.takenUsername){
                     $scope.registerMessage = "username already exists: " + $scope.takenUsername;
                }
            })
                        
        }])
    
    

        .controller('LoginController', ['$scope',  'userService', function($scope,  userService) {
          $scope.username = ''
          $scope.invalidUsername = false;
          $scope.invalidUsernameString = ""
          $scope.login = function () {
            var request = userService.getItem($scope.username);
            request.
            on('success', function(response) {
                if (validUser(response.data.Item)){
                    $scope.setCurrentUser(convertUserObjectToJson(response.data.Item));
                    $scope.invalidUsername = false;
                }
                else {
                    $scope.invalidUsername = true;
                    $scope.invalidUsernameString = $scope.username + " " + "is not a valid username, please register"
                }
            }).
            on('error', function(response) {
                console.log("Error!");
                $scope.invalidUsername = true;
                $scope.invalidUsernameString = "Server Error, please try again later " + " " + response;
            }).
            on('complete', function(response) {
                $scope.$apply();
            }).
            send();
       };
           
    }])

    .controller('ApplicationController', ['$scope', function($scope ) {
            $scope.currentUser = null;
            $scope.userFlights = [];
            $scope.plotsReady = false;
            $scope.setCurrentUser = function (user) {
                $scope.currentUser = user;
            };

            $scope.addUserFlight = function(flight){
                //attempt to find fares for this flight
                $scope.userFlights.push(flight);
            }

             $scope.resetUserFlights = function(){
                $scope.userFlights = [];
             }

             $scope.setPlotsReady = function(ready){
                $scope.plotsReady = ready;
             }

            $scope.tests = [{'number' : 100},{'number' : 300}];

}])

;