// Set dependencies
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");

const journeyPlanner = require("./src/journeyPlanner");

// Setup express, views and public assets access
const app = express();
app.set("view engine", "ejs");
app.set("views", "views");
app.use(bodyParser.urlencoded({ extended: true }));

// q1 show journey routes
app.get("/routes", function(req, res) {
  let journeys,
    origin,
    destination = null;

  origin = req.query.origin ? req.query.origin : "A";
  destination = req.query.destination ? req.query.destination : "C";

  journeys = journeyPlanner.findJourneys(origin, destination, "routesTotal");

  journeys = res.render("showRoutes", {
    pageTitle: "Code Challenge - Show Routes",
    journeys: journeys
  });
});

// q2 journeys by cheapest price & q3 journeys by duration time
app.get("/journeys", function(req, res) {
  let journeys,
    origin,
    destination,
    orderBy,
    departure = null;

  origin = req.query.origin ? req.query.origin : "A";
  destination = req.query.destination ? req.query.destination : "C";
  departure = req.query.departure
    ? decodeURI(req.query.departure)
    : "20/09/2019 13:00";
  orderBy = req.query.order ? req.query.order : "priceTotal";

  journeys = journeyPlanner.findJourneys(
    origin,
    destination,
    orderBy,
    departure
  );

  journeys = res.render("showJourneys", {
    pageTitle: "Code Challenge - Show Journeys",
    journeys: journeys,
    orderBy: orderBy
  });
});

// module.exports = app;
app.listen(3001);
