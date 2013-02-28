var entityManager = require("../../entity")
         , config = require("config")
          , async = require('async')
          , users = require("../users")
            , api = require("../../api")
              , _ = require("underscore");

// app global object
var app;

/**
 * @author Pirhoo
 * @description Missions route handlers
 *
 */
module.exports = function(_app) {  

  app = _app;

};