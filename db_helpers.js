"use strict";

var query = require("pg-query");
var pg = require("pg");
var sprintf = require("sprintf").sprintf;
var winston = require("winston");

var config = require("./config").config;

query.connectionParameters = "postgres://localhost:5432/saurav";

/* Custom query builder function to construct the SQL query
 * that will be sent via the pg adapter to query for cleaners.
 * Creates the query based on the parameters present.
 * @param country: The country code (e.g de, ch, nl)
 * @param location: Object that contains latitude and longitude values.
 * @param gender: Single character representing the gender.
 * @param preferences: Array of preferences to look for.
 */
var queryBuilder = function(country, location, gender, preferences) {
  // checks for null and undefined.
  if (country == null) {
    winston.log("error", "Country is missing!");
    process.exit(1);
  }

  if (location == null || location.latitude == null || location.longitude == null) {
    winston.log("error", "Location is missing!");
    process.exit(1);
  }

  var radius = config[country];
  var body = {
    'radius': radius,
    'lat': location.latitude,
    'lon': location.longitude
  };

  var baseString =   "SELECT *, earth_distance(ll_to_earth(%(lat)f, %(lon)f), ll_to_earth(latitude, longitude)) as cleaner_distance FROM cleaners WHERE earth_box(ll_to_earth(%(lat)f, %(lon)f), %(radius)d) @> ll_to_earth(latitude, longitude)";

  var baseQuery = sprintf(baseString, body);
  if (gender != null) {
    baseQuery += sprintf(" AND gender = \'%s\'", gender);
  }

  if (preferences != null) {
    baseQuery += " AND (preferences) @> '{";
    for (var i = 0; i < preferences.length; i++) {
      baseQuery += '"' + preferences[i] + '"';
      if (i != preferences.length - 1) {
        baseQuery += ',';
      }
    }
    baseQuery += "}'";
  }
  baseQuery += " ORDER BY cleaner_distance";
  return baseQuery;
};
exports.queryBuilder = queryBuilder;

/* get_matches(q, callback) --> used to make a call to the postgres db
 * @param q: The query parameter to pass.
 * @param cb: The callback function to return results.
 */
var get_matches = function(q, cb) {
  if (q == null)
    q = cleaner_query;
  query(q, function(err, rows, result) {
    var results = [];
    if (err) {
      winston.log("error", err.message);
      process.exit(1);
    } else {
      for (var i in rows) {
        results.push(rows[i]);
      }
    }
    pg.end();
    cb(results);
  });
};
exports.get_matches = get_matches;
