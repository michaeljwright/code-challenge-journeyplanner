// load packages
const Lodash = require("lodash");
const Uuid = require("uuid-by-string");
const Moment = require("moment");

// load data
const routesData = require("../data/routes.json");
const flightsData = require("../data/flights.json");

// look up flights based on route
exports.lookupFlights = (route, departureTime) => {
  let foundFlights = Lodash.filter(flightsData, function(flight) {
    return flight.route == route.route_id;
  });

  if (foundFlights) {
    // loop through flights
    foundFlights.forEach(function(flight) {
      // add departure time to unix timestamp format
      let regex = /\d+/g;
      let flightDepartureTime = flight.departure.match(regex);
      flightDepartureTime = Moment()
        .add({ days: flightDepartureTime[0], hours: flightDepartureTime[1] })
        .unix();
      flight.departureUnix = flightDepartureTime;
    });

    // check if departure time is after inputted departure time
    if (departureTime) {
      foundFlights = Lodash.filter(foundFlights, function(flight) {
        return flight.departureUnix >= departureTime;
      });
    }
  }

  return foundFlights;
};

// find routes from specific origin to destination
exports.findRoutesForDestination = (
  originRoute,
  destination,
  departureTime = null
) => {
  let foundRoute = [];

  // look up first flights (from origin route)
  originRoute["flights"] = exports.lookupFlights(originRoute, departureTime);
  if (originRoute.flights.length > 0) {
    foundRoute.push(originRoute);
  }

  // if connection route (if not destination)
  if (originRoute.to != destination) {
    let foundRoutes = Lodash.filter(routesData, function(route) {
      return route.from == originRoute.to && route.to != originRoute.from;
    });

    if (foundRoutes) {
      let foundDestination = Lodash.find(foundRoutes, function(route) {
        return route.to == destination;
      });

      if (foundDestination) {
        // if destination found for connection route then look up flights
        foundDestination["flights"] = exports.lookupFlights(
          foundDestination,
          departureTime
        );
        if (foundDestination.flights.length > 0) {
          foundRoute.push(foundDestination);
        }
      } else {
        // reset routes
        foundRoute = [];
      }
    } else {
      // reset routes
      foundRoute = [];
    }
  }

  return foundRoute;
};

// find journeys based on given origin and destination
exports.findJourneys = (origin, destination, orderBy, departureTime = null) => {
  let journeys = [];

  // if inputted departureTime then convert it to unix
  if (departureTime) {
    departureTime = Moment(departureTime, "DD/MM/YYYY HH:mm").unix();
  }

  // find routes from requested origin
  let foundOrigins = exports.findRoutesFromOrigin(origin);

  // if flight from origin then find routes from origins through to destination
  if (foundOrigins) {
    foundOrigins.forEach(function(origin) {
      foundRoutes = exports.findRoutesForDestination(
        origin,
        destination,
        departureTime
      );

      if (!Lodash.isEmpty(foundRoutes)) {
        // list of possible journeys (need to review not possible journeys)
        journeys.push({
          journeyId: Uuid("" + Date.now() + ""),
          routes: foundRoutes,
          routesTotal: foundRoutes.length,
          durationTotal: exports.calcDuration(foundRoutes),
          priceTotal: exports.calcPrice(foundRoutes)
        });
      }
    });
  }

  // order the results
  if (journeys) {
    journeys = Lodash.orderBy(journeys, orderBy, "asc");
  }

  console.log(JSON.stringify(journeys));
  console.log("----------------------");

  return journeys;
};

// calcuate duration of combined routes
exports.calcDuration = routes => {
  durationTotal = 0;

  routes.forEach(function(route) {
    durationTotal = durationTotal + route.duration;
  });

  return durationTotal;
};

// calcuate total price of combined routes
exports.calcPrice = routes => {
  priceTotal = 0;

  routes.forEach(function(route) {
    flights = Lodash.orderBy(route.flights, "price", "asc");
    priceTotal += flights[0].price;
  });

  return priceTotal;
};

// find routes from origin
exports.findRoutesFromOrigin = origin => {
  let foundRoutes = Lodash.filter(routesData, function(routeItem) {
    return routeItem.from == origin;
  });

  return foundRoutes;
};
