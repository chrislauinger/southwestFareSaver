
var monthNames = [
  "Jan", "Feb", "Mar",
  "Apr", "May", "June", "July",
  "Aug", "Sep", "Oct",
  "Nov", "Dec"
];

function compareFares(a,b) {
  if (a.date < b.date)
    return -1;
  else if (a.date > b.date)
    return 1;
  else 
    return 0;
}

function UserFlight(data){
    this.date = new Date();
    this.date.setTime(parseInt(data.date.N));
    this.username = data.username.S;
    this.origin = data.origin.S;
    this.destination = data.destination.S;
    this.flightNumber = parseInt(data.flight_number.N);
    this.cost = parseInt(data.cost.N);
    this.usingPoints = data.using_points.BOOL;
    this.flightKey = data.flight_key.S;
    this.fareHistory = {dataset0 : []};
    this.route = this.origin.toString() + "_" + this.destination.toString();

    var day = this.date.getUTCDate();
    var month = this.date.getUTCMonth();
    var monthStr = monthNames[month];
    var year = this.date.getUTCFullYear();
    this.displayStr = monthStr + " " + day.toString() + ": " + this.origin + " -> " + this.destination;
    this.refundStr = "Checking for Refunds...";
    this.foundRefund = false;

    this.hasFares = function(){
      return (this.fareHistory.dataset0.length > 0)
    }

}

var midnightDateString = function(date){
  return (date.getTime() - date.getTimezoneOffset()*60*1000).toString();
}

var validUser = function(data){
  if (typeof data === 'undefined'){ return false;}
  else { return true; } 
};

var convertUserObjectToJson = function(data){
  var jsonObject = {};
  jsonObject.username = data.username.S;
  jsonObject.firstName = data.first_name.S;
  jsonObject.lastName = data.last_name.S;
  jsonObject.email = data.email.S;
  return jsonObject;
};

var getUserItem = function(data){
  var item = {
  "username": {"S": data.username},
  "first_name": {"S": data.firstName},
  "last_name": {"S": data.lastName},
  "email": {"S": data.email}
}
return item;
};

var  getUserFlightItem = function(flightInfo, username){
  var dateStr=  midnightDateString(flightInfo.date);
  var numberStr = flightInfo.flightNumber.toString();
  var route = flightInfo.origin.toString() + "_" + flightInfo.destination.toString();
  var key = route + "_" + dateStr + "_" + numberStr;
  var item = {
    "flight_key" : {"S" : key},
    "username" : {"S" : username},
    "origin" : {"S" : flightInfo.origin},
    "destination" : {"S" : flightInfo.destination},
    "date" : {"N" : dateStr},
    "flight_number" : {"N" : numberStr },
    "cost" : {"N" : flightInfo.cost.toString()},
    "using_points" : {"BOOL" : flightInfo.usingPoints},
    "sent_email" : {"BOOL" : flightInfo.sentEmail}
  }
  return item;
}

var validAirportCode = function(airport){
    if (typeof(airport) != "string" || airport === ""){ return false;}
    var cities = ['GSP', 'FNT', 'BOS', 'OAK', 'LIT', 'BOI', 'SAN', 'DCA', 'LBB', 'BWI', 
    'PIT', 'RIC', 'SAT', 'JAX', 'IAD', 'JAN', 'HRL', 'CHS', 'EYW', 'BNA',
    'PHL', 'SNA', 'SFO', 'PHX', 'LAX', 'MAF', 'LAS', 'CRP', 'CMH', 'FLL', 
    'DEN', 'DTW', 'BUR', 'ROC', 'GEG', 'BUF', 'GRR', 'BDL', 'DSM', 'EWR', 
    'MHT', 'PBI', 'RNO', 'OKC', 'IND', 'ATL', 'ISP', 'SMF', 'BKG', 'PVD', 
    'SEA', 'ECP', 'ICT', 'MDW', 'RDU', 'PDX', 'CLE', 'SJU', 'AUS', 'CLT', 
    'SJC', 'ELP', 'OMA', 'MEM', 'TUS', 'ALB', 'TUL', 'ORF', 'MKE', 'MSY', 
    'MSP', 'CAK', 'TPA', 'DAL', 'DAY', 'ONT', 'STL', 'ABQ', 'HOU', 'SLC', 
    'MCO', 'RSW', 'BHM', 'MCI', 'PNS', 'LGA', 'AMA', 'SDF', 'PWM'];
    return (cities.indexOf(airport.toUpperCase()) != -1);
}

var oldDate = function(date){
  if (String(date).length < 7){
   return false;
  }
  var fieldDate = new Date(date);
  return (fieldDate.getTime() < (Date.now() - (86400 * 1000)));
}

var futureDate = function(date){
  if (String(date).length < 7){
   return false;
  }
  var fieldDate = new Date(date);
  return (fieldDate.getTime() > (Date.now() + (86400 * 1000 * 365 * 2))); //2 years in advance
}