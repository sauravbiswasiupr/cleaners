"use strict";

var pg = require("pg");
var query = require("pg-query");
var winston = require("winston");

query.connectionParameters = "postgres://localhost:5432/saurav";

var SQL_QUERY = "CREATE EXTENSION IF NOT EXISTS cube;" +
                "CREATE EXTENSION IF NOT EXISTS earthdistance;" +
                "CREATE TABLE IF NOT EXISTS cleaners(" +
                "id CHAR(20) NOT NULL UNIQUE PRIMARY KEY," +
                "name VARCHAR(255) NOT NULL," +
                "country_code CHAR(2)," +
                "latitude NUMERIC," +
                "longitude NUMERIC," +
                "gender CHAR(1)," +
                "preferences TEXT[]);";

/* Custom function to create the schema for the cleaners table.
 *  Also executes creation of cube and earthdistance extensions.
 */
var create_schema_function = function() {
  query(SQL_QUERY, function(err, rows, result) {
    if (err) {
      winston.log(error, err.message);
      process.exit(1);
    }
    winston.log("info", "Initialized schema successfully for table cleaners");
    pg.end();
  });
};

create_schema_function();
