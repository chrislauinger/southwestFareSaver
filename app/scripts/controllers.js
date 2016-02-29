'use strict';

angular.module('southwestFareSaverApp')

.controller('PlotController', ['$scope', '$rootScope', 'fareService', 'userFlightService', 'dataFactory', function($scope, $rootScope, fareService, userFlightService, dataFactory) {
  var defaultOptions = {
    series: [
    {
        axis: "y",
        dataset : "dataset0",
        key: "currentPrice",
        label: "current price",
        color: "#0057e7",
        type: ['line']
    },
    {
        axis: "y",
        dataset: "dataset0",
        key: "cost",
        label: "purchase price",
        color: "#028900",
        type: ['line']
    }],
    axes: {x: {key: "date", type : "date"}, y: {min : 0, max : 100}},
    margin: {
        top: 10,
        right: 40,
        bottom: 20,
        left: 40
    }
    };

$scope.getOptions = function(flight){
    var currentOptions = defaultOptions;

    var minCost = 1000000;
    var maxCost = 0;
    if (flight.fareHistory.dataset0.length > 0){
        flight.fareHistory.dataset0.forEach(function(fareItem, i){
            var currentPrice = fareItem.currentPrice;
            var cost = fareItem.cost;
            if (currentPrice > maxCost){ maxCost = currentPrice;}
            if (currentPrice < minCost){ minCost = currentPrice;}
            if (cost > maxCost){ maxCost = cost;}
            if (cost < minCost){ minCost = cost;}
        });
        var buffer = maxCost * 0.1
        defaultOptions.axes.y.min = minCost - buffer;
        defaultOptions.axes.y.max = maxCost + buffer;
    }
    return currentOptions;
}

$scope.userFlights = dataFactory.getUserFlights();

$scope.addFaresToUserFlights = function(){
   dataFactory.getUserFlights().forEach(function(flight, i){
    fareService.getFares(flight)
    .on('success', function(response){
         if (response.data.Items.length > 0){
            for (var j = 0; j < response.data.Items.length; j++){
                var fareValidityDate = parseInt(response.data.Items[j].fare_validity_date.N);
                var currentPrice = flight.usingPoints ?  parseInt(response.data.Items[j].points.N) : parseInt(response.data.Items[j].price.N);
                var fareItem = { 'date' : new Date(fareValidityDate), 'currentPrice' : currentPrice, 'cost' : flight.cost};
                flight.fareHistory.dataset0.push(fareItem);
                if (response.data.Items.length == 1){
                    var repeatFareItem = { 'date' : new Date(fareValidityDate - (60 * 1000 * 10)), 'currentPrice' : currentPrice, 'cost' : flight.cost};
                    flight.fareHistory.dataset0.push(repeatFareItem);
                }
            }
            flight.fareHistory.dataset0.sort(compareFares);
            var lastestFare = flight.fareHistory.dataset0[flight.fareHistory.dataset0.length -1];
            if (lastestFare.currentPrice >= lastestFare.cost){
                flight.refundStr = "No Refund Currently";
            }
            else {
                var txt = "southwest";
                flight.refundStr = "Refund Found! Rebook on southwest for a refund of " + diffCostString(lastestFare.cost - lastestFare.currentPrice, flight.usingPoints);
                flight.foundRefund = true;
            }
        }
        else {
             flight.loadingMessage = "No fares found yet. Read more here"
        }
                    }).
    on('error', function(response) {
        console.log('fail get fares');
        console.log(response);
    }).
    on('complete', function(response) {
        $scope.userFlights = dataFactory.getUserFlights();
        $scope.$apply();
    })
    .send();
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
    if ($scope.userFlights.length > 0){
        dataFactory.setNoFlights(false);
    }
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
    userFlightService.deleteFlight(flight)
    .on('success', function(response) {
        console.log("deleteFlight")
        $scope.updateFlightDisplay();
    }).
    on('error', function(response) {
       console.log('fail to delete flight');
       console.log(response);
   }).send();
}

$scope.allowDeleteSelected = false;

$scope.hasFares = function(flight){
    return flight.hasFares();
}

}]) 
.controller('FlightFormController', ['$scope', '$rootScope', 'userFlightService','dataFactory', 'pythonFactory', function($scope, $rootScope, userFlightService, dataFactory, pythonFactory) {

    $scope.startedPlotting = false;
    $scope.flightInfo = {origin : "", destination : "", date : "", flightNumber: "", cost : "", usingPoints : false, sentEmail : false};
    $scope.currentDate = new Date();
    $scope.scraping = false;

            $scope.submitFlight = function(){
                $scope.scraping = true; 
                if ($scope.flightInfo.cost > 2000){
                    $scope.flightInfo.usingPoints = true;
                }
                $scope.flightInfo.origin = $scope.flightInfo.origin.toUpperCase();
                $scope.flightInfo.destination = $scope.flightInfo.destination.toUpperCase();
                userFlightService.addFlight($scope.flightInfo, dataFactory.getCurrentUser().username)
                .on('success', function(response) {
                }).
                on('error', function(response) {
                 console.log('fail add flight');
                 console.log(response);
             }).
                on('complete', function(response) {
                    pythonFactory.runUserFares($scope.flightInfo)
                    .then(function successCallback(response) {
                            $scope.scraping = false;
                            $scope.clearForm();
                            $rootScope.$emit('userFlightsChange', {});
                    }, function errorCallback(response) {
                        $scope.scraping = false;
                        $scope.clearForm();
                        $rootScope.$emit('userFlightsChange', {});
                    })
                }).send();
            }
            $scope.clearForm = function(){
                $scope.flightInfo = {origin : "", destination : "", date : "", flightNumber: "", cost : "", usingPoints : false , sentEmail : false};
                $scope.bookedForm.$setPristine();
            }

            $scope.validAirport = function(val){
                return validAirportCode(val);
            }

            $scope.oldDate = function(val){
                return oldDate(val);
            }

            $scope.futureDate = function(val){
                return futureDate(val);
            }

        }])

.controller('RegisterController', ['$scope', 'userService', 'dataFactory',function($scope, userService,dataFactory) {
            $scope.registerInfo = {username:"", firstName:"", lastName:"", email:"" };
            $scope.registerMessage = "";
            $scope.takenUsername = "xlau"; //just 
            $scope.invalidUsername = false;
            $scope.registerUser = function (){
                $scope.registerMessage = "Loading ...";

                userService.putUser($scope.registerInfo).
                on('success', function(response) {
                    dataFactory.setCurrentUser($scope.registerInfo);
                }).
                on('error', function(response) {
                        if (response.message === "The conditional request failed"){ //username already exists
                            $scope.takenUsername = $scope.registerInfo.username;
                            $scope.registerMessage = "username already exists: " + $scope.takenUsername;
                             $scope.invalidUsername = true;
                        }
                        else{
                            $scope.registerMessage = response;
                        }
                    }).
                on('complete', function(response) {
                    dataFactory.setNoFlights(true);
                    $scope.$apply();
                }).send();

            }

            $scope.clearForm = function(){
                $scope.registerInfo = {username:"", firstName:"", lastName:"", email:"" };
            }

            $scope.$watch('registerInfo.username', function (newValue, oldValue) {
                if (newValue != $scope.takenUsername){
                    $scope.registerMessage = "";
                    $scope.invalidUsername = false;
                }
                if (newValue == $scope.takenUsername){
                   $scope.registerMessage = "username already exists: " + $scope.takenUsername;
                   $scope.invalidUsername = true;
               }
           })

        }])

.controller('LoginController', ['$scope', 'userService','userFlightService', 'dataFactory', function($scope, userService, userFlightService, dataFactory) {
  $scope.username = '';
  $scope.invalidUsername = false;
  $scope.invalidUsernameString = "null"
  $scope.invalidUsernameMessage = ""

  $scope.login = function () {
    var request = userService.getItem($scope.username);
    request.
    on('success', function(response) {
        if (validUser(response.data.Item)){
            dataFactory.setCurrentUser(convertUserObjectToJson(response.data.Item));
            $scope.invalidUsername = false;
            userFlightService.getFlights(dataFactory.getCurrentUser().username)
            .on('success', function(response) {
                if (response.data.Items.length == 0){
                    dataFactory.setNoFlights(true);
                     $scope.$apply();
                }})
            .on('error', function(response) {
                console.log("error userflights");
            }).send();
        }
        else {
            $scope.invalidUsername = true;
            $scope.invalidUsernameString = $scope.username;
            $scope.invalidUsernameMessage = $scope.username + " " + "is not a valid username, please register";
        }
    }).
    on('error', function(response) {
        $scope.invalidUsername = true;
        $scope.invalidUsernameMessage = "Server Error, please try again later " + " " + response;
    }).
    on('complete', function(response) {
        $scope.$apply();
    }).
    send();
};

              $scope.$watch('username', function (newValue, oldValue) {
                if (newValue != $scope.invalidUsernameString){
                    $scope.invalidUsername = false;
                }
                if (newValue == $scope.invalidUsernameString){
                   $scope.invalidUsername = true;
               }
           })

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
.controller('UserController', ['$scope', '$state' ,'dataFactory', function($scope, $state, dataFactory) {
    $scope.currentUser = null;
    $scope.getCurrentUser = function(){
        $scope.currentUser = dataFactory.getCurrentUser();
        return $scope.currentUser;
    }
    $scope.isHomeState = function(){
        var state = $state.current;
        if (state.name === 'app'){
            return true;
        }
        return false;
    }

    $scope.noFlights = null;
    $scope.getNoFlights = function(){
        $scope.noFlights = dataFactory.getNoFlights();
        return $scope.noFlights;
    }
    $scope.usingChrome = false;
     var ua = window.navigator.userAgent;
     if (ua.indexOf("Chrome") > 0){
        $scope.usingChrome = true;
     }


}])

;