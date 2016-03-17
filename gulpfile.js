"use strict";

var gulp = require("gulp");
var winston = require("winston");
var argv = require("yargs").array("preferences").array("geo").argv;

var get_matches = require("./db_helpers").get_matches;
var queryBuilder = require("./db_helpers").queryBuilder;

// Gulp task to get matches based on certain arguments passed.
gulp.task('get-matches', function() {
  if (argv.gender) {
    var gender = argv.gender;
  }
  if (argv.country) {
    var country = argv.country;
  }
  if (argv.geo) {
    var loc_array = argv.geo["0"].split(",").map(parseFloat);
    var location = {'latitude': loc_array[0], 'longitude': loc_array[1]};
  }
  if (argv.preferences) {
    var preferences = argv.preferences[0].split(",")
  }
  var query = queryBuilder(country, location, gender, preferences);

  get_matches(query, function(results) {
    for (var j = 0; j < results.length; j++) {
      var result = results[j];
      var s = "- id: " + result.id + " - name: " + result.name + " - gender: " + result.gender + " - preferences: ";
      for (var i = 0; i < result.preferences.length; i++) {
        s += result.preferences[i];
        if (i != result.preferences.length - 1) {
          s += ","
        }
      }
      winston.log('info', s);
    }
  });
});
