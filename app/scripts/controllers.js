'use strict';

angular.module('southwestFareSaverApp')

    .controller('PlotController', ['$scope', '$rootScope', 'fareService', 'userFlightService', 'dataFactory', function($scope, $rootScope, fareService, userFlightService, dataFactory) {
          $scope.options = {
            series: [
              {
                axis: "y",
                dataset : "dataset0",
                key: "currentPrice",
                label: "M",
                color: "#0057e7",
                type: ['line']
              },
             {
                axis: "y",
                dataset: "dataset0",
                key: "cost",
                label: "P",
                color: "#028900",
                type: ['line']
              },

            ],
            axes: {x: {key: "date", type : "date"},
                    y: {min : 0}
                }
          };

           $scope.userFlights = dataFactory.getUserFlights();

           $scope.addFaresToUserFlights = function(){
                 dataFactory.getUserFlights().forEach(function(flight, i){
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
                        }
                        
                        flight.fareHistory.sort(compareFares);
                        var lastestFare = flight.fareHistory[flight.fareHistory.length -1];
                        if (lastestFare.currentPrice >= lastestFare.cost){
                            flight.refundStr = "No Refund Currently";
                        }
                        else {
                            flight.refundStr = "Refund Found! " + "Rebook on southwest.com for a refund of " + (lastestFare.cost - lastestFare.currentPrice).toString();
                        }
                        flight.fareHistory = {dataset0 : flight.fareHistory};
                        if (i === ($scope.userFlights.length-1)){ //signal last fare pushed, ready to plots
                            $scope.userFlights = dataFactory.getUserFlights();
                            $scope.$apply();
                        }
                    }).
                    on('error', function(response) {
                       console.log('fail get fares');
                       console.log(response);
                    }).send();
                
                })
            }

            $scope.updateFlightDisplay = function(){
                 userFlightService.getFlights(dataFactory.getCurrentUser().username)
                 .on('success', function(response) {
                            dataFactory.resetUserFlights();
                            for (var i = 0; i < response.data.Items.length; i++){
                                dataFactory.addUserFlight(new UserFlight(response.data.Items[i]));
                            }
                    }).
                    on('error', function(response) {
                       console.log('fail get flight');
                       console.log(response);
                    }).
                    on('complete', function(response) {
                        $scope.userFlights = dataFactory.getUserFlights();
                        $scope.addFaresToUserFlights();
                    }).send();
            }


          if (dataFactory.getCurrentUser() != null && dataFactory.getUserFlights().length === 0){
            $scope.updateFlightDisplay();
           }

           $rootScope.$on('userFlightsChange', function (event, args) {
                $scope.updateFlightDisplay();
                }
            )

           $scope.deleteFlight = function(flight){
            console.log(flight);
            userFlightService.deleteFlight(flight)
            .on('success', function(response) {
                console.log("deleteFlight")
                //TODO: update plots after delete
            }).
            on('error', function(response) {
                 console.log('fail to delete flight');
                 console.log(response);
             }).send();
           }




        }]) 

        .controller('FlightFormController', ['$scope', '$rootScope', 'userFlightService','dataFactory', function($scope, $rootScope, userFlightService, dataFactory) {
            
            $scope.startedPlotting = false;
            $scope.flightInfo = {origin : "", destination : "", date : "", flightNumber: "", cost : "", usingPoints : false};
            
            //TODO: verify flight is real?, 
            $scope.submitFlight = function(){
                //check origin
                if (!validAirportCode($scope.flightInfo.origin)){ console.log("invalid origin")};
                if (!validAirportCode($scope.flightInfo.destination)){ console.log("invalid destination")};

                userFlightService.addFlight($scope.flightInfo, dataFactory.getCurrentUser().username)
                 .on('success', function(response) {

                    }).
                    on('error', function(response) {
                       console.log('fail add flight');
                       console.log(response);
                    }).
                    on('complete', function(response) {
                        $scope.clearForm();
                        $scope.$apply();
                        $rootScope.$emit('userFlightsChange', {});
                    }).send();
            }
            $scope.clearForm = function(){
                $scope.flightInfo = {origin : "", destination : "", date : "", flightNumber: "", cost : "", usingPoints : false};
            }

        }])

        .controller('RegisterController', ['$scope', 'userService', 'dataFactory',function($scope, userService,dataFactory) {
            //check for dup username
            $scope.registerInfo = {username:"", firstName:"", lastName:"", email:"" };
            $scope.registerMessage = "";
            $scope.takenUsername = "chrislauinger"; //just 
            $scope.registerUser = function (){
                $scope.registerMessage = "Loading ...";

                    userService.putUser($scope.registerInfo).
                    on('success', function(response) {
                        dataFactory.setCurrentUser($scope.registerInfo);

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

    .controller('LoginController', ['$scope', 'userService','dataFactory', function($scope, userService, dataFactory) {
          $scope.username = ''
          $scope.invalidUsername = false;
          $scope.invalidUsernameString = ""

          $scope.login = function () {
            var request = userService.getItem($scope.username);
            request.
            on('success', function(response) {
                if (validUser(response.data.Item)){
                    dataFactory.setCurrentUser(convertUserObjectToJson(response.data.Item));
                    $scope.invalidUsername = false;
                }
                else {
                    $scope.invalidUsername = true;
                    $scope.invalidUsernameString = $scope.username + " " + "is not a valid username, please register"
                }
            }).
            on('error', function(response) {
                console.log("Error!");
                console.log(response);
                console.log($scope.username);
                $scope.invalidUsername = true;
                $scope.invalidUsernameString = "Server Error, please try again later " + " " + response;
            }).
            on('complete', function(response) {
                $scope.$apply();
            }).
            send();
       };
          
    }])

    .controller('TabController', ['$scope', 'dataFactory', function($scope,dataFactory) {
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
        .controller('UserController', ['$scope', 'dataFactory', function($scope,dataFactory) {
            $scope.currentUser = null;
            $scope.getCurrentUser = function(){
                $scope.currentUser = dataFactory.getCurrentUser();
                return $scope.currentUser;
            }

        }])


;