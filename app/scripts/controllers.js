'use strict';

angular.module('southwestFareSaverApp')

    .controller('PlotController', ['$scope', 'userFlightService',function($scope, userFlightService) {
       $scope.data = {
            dataset0: [
              {x: new Date("2016-01-26"), val_0: 250, val_1 : 200},
              {x: new Date("2016-01-29"), val_0: 325, val_1 : 200},
              {x: new Date("2016-01-30"), val_0: 300, val_1 : 200},
            ]
          };

          $scope.options = {
            series: [
              {
                axis: "y",
                dataset: "dataset0",
                key: "val_0",
                label: "Market",
                color: "#1f77b4",
                type: ['line','dot'],
                id: 'mySeries0'
              },
             {
                axis: "y",
                dataset: "dataset0",
                key: "val_1",
                label: "Purchase",
                color: "#00ff00",
                type: ['line','dot'],
                id: 'mySeries0'
              },

            ],
            axes: {x: {key: "x", type : "date"}}
          };
 
}]) 

        .controller('TrackController', ['$scope', 'userFlightService', 'fareService', function($scope, userFlightService, fareService) {
            $scope.flightInfo = {origin : "", destination : "", date : "", flightNumber: "", cost : "", usingPoints : false};
            
            //TODO: verify flight is real?, 
            //TODO: when update flight display at end, it repeats flights
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
                        $scope.updateFlightDislay();
                    }).send();
                
            }

            $scope.addFaresToUserFlights = function(){
                $scope.userFlights.forEach(function(flight, i){
                    fareService.getFares(flight)
                    .on('success', function(response){
                        for (var j = 0; j < response.data.Items.length; j++){
                                var fareValidityDate = parseInt(response.data.Items[j].fare_validity_date.N);
                                var cost = flight.usingPoints ?  parseInt(response.data.Items[j].points.N) : parseInt(response.data.Items[j].price.N);
                                var fareItem = { 'date' : fareValidityDate, 'cost' : cost};
                                flight.fareHistory.push(fareItem);
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
    
    
        .controller('ContactController', ['$scope', function($scope) {

            $scope.feedback = {mychannel:"", firstName:"", lastName:"", agree:false, email:"" };
            
            var channels = [{value:"tel", label:"Tel."}, {value:"Email",label:"Email"}];
            
            $scope.channels = channels;
            $scope.invalidChannelSelection = false;
                        
        }])

        .controller('FeedbackController', ['$scope', 'feedbackFactory', function($scope, feedbackFactory) {
            
            $scope.sendFeedback = function() {
                console.log($scope.feedback);
                if ($scope.feedback.agree && ($scope.feedback.mychannel == "")) {
                    $scope.invalidChannelSelection = true;
                    console.log('incorrect');
                }
                else {
                    feedbackFactory.getFeedback().save($scope.feedback);
                    $scope.invalidChannelSelection = false;
                    $scope.feedback = {mychannel:"", firstName:"", lastName:"", agree:false, email:"" };
                    $scope.feedback.mychannel="";
                    $scope.feedbackForm.$setPristine();
                    console.log($scope.feedback);
                }
            };
        }])

        .controller('DishDetailController', ['$scope', '$stateParams', 'menuFactory', function($scope, $stateParams, menuFactory) {

            $scope.showDish = false;
            $scope.message="Loading ...";
            $scope.dish = menuFactory.getDishes().get({id:parseInt($stateParams.id,10)})
            .$promise.then(
                            function(response){
                                $scope.dish = response;
                                $scope.showDish = true;
                            },
                            function(response) {
                                $scope.message = "Error: "+response.status + " " + response.statusText;
                            }
            );
            
        }])

         .controller('DishCommentController', ['$scope', 'menuFactory', function($scope,menuFactory) {
            
            $scope.mycomment = {rating:5, comment:"", author:"", date:""};
            
            $scope.submitComment = function () {
                                $scope.mycomment.date = new Date().toISOString();
                                console.log($scope.mycomment);
                                $scope.dish.comments.push($scope.mycomment);

                menuFactory.getDishes().update({id:$scope.dish.id},$scope.dish);
                                $scope.commentForm.$setPristine();
                                $scope.mycomment = {rating:5, comment:"", author:"", date:""};
            }
        }])

        .controller('IndexController', ['$scope', 'menuFactory', 'corporateFactory', function($scope, menuFactory, corporateFactory) {
            $scope.showDish = false;
            $scope.message="Loading ...";
            $scope.dish = menuFactory.getDishes().get({id:0})
            .$promise.then(
                function(response){
                    $scope.dish = response;
                    $scope.showDish = true;
                },
                function(response) {
                    $scope.message = "Error: "+response.status + " " + response.statusText;
                }
            );

            $scope.showPromotion = false;
            $scope.promotionMessage="Loading ...";
            $scope.homePromotion = menuFactory.getPromotions().get({id:0})
            .$promise.then(
                function(response){
                    $scope.homePromotion = response;
                    $scope.showPromotion = true;
                },
                function(response) {
                    $scope.promotionMessage = "Error: " + response.status + " " + response.statusText;
                }
            );

            $scope.showLeader = false;
            $scope.leaderMessage="Loading ...";
            $scope.homeLeader = corporateFactory.getLeaders().get({id:3})
            .$promise.then(
                function(response){
                    $scope.homeLeader = response;
                    $scope.showLeader = true;
                },
                function(response) {
                    $scope.leaderMessage = "Error: " + response.status + " " + response.statusText;
                }
            );

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

            $scope.tests = [{'number' : 100},{'number' : 300}];

}])

;