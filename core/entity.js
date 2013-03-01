var api = require("./api.js");

function EntityManager() {}

/**
 * Add an entity to the database
 * @param {Object}          entity    Entity object
 * @param {String}          fid       Identifier of the entity in its family   
 * @param {Integer|String}  family    Family identifier (id or resource uri)
 * @param {String}          solution  (optional) Solution of a trusted source
 * @param {Function}        callback  Callback function
 */
EntityManager.prototype.add = function(entity, fid, family, solution, callback) {
    callback = callback || function() {};
    var data = { 
        // Stringify the entity
        body: JSON.stringify(entity), 
        // Specify the entity id (from its provider) to avoid duplicates
        fid: fid,
        // Specify the family (Tweet, FB update, etc)
        family: family,
        // Add the solution
        solution: solution
    };

    api.entity.post(data, callback);
};

/**
 * Record an entity evaluation
 * @param {String}          value     Value of the evaluation
 * @param {String}          fid       Identifier of the entity in its family   
 * @param {Integer|String}  family    Family identifier (id or resource uri)
 * @param {Function}        callback  Callback function
 */
EntityManager.prototype.eval = function(value, fid, family, callback) {

    callback = callback || function() {};
    var data = { 
        user: 4,
        // Stringify the value if need
        value: typeof(value) == "string" ? value : JSON.stringify(value), 
        // Specify the entity id (from its provider)
        fid: fid,
        // Specify the family (Tweet, FB update, etc)
        family: family
    };

    // We use the couple fid/family that is the best way to identificate
    // an unique entity through the database 
    api.entity_eval.post(data, callback);
};

/**
 * Get an entity to evaluate that the user didn't evaluate yet
 * @param  {Integer}  family    Family id
 * @param  {Integer}  user      User id
 * @param  {Function} callback  Callback function  
 */
EntityManager.prototype.entityToEval = function(family, user, callback) {
  api.entity({
    // Filter by family
    family: family,
    // The given didn't evalute the entity before
    not_evaluated_by: user,
    // No solution given
    solution: "",
    // Get just 1 entity
    limit: 1,
  }).get(callback);
}

/**
 * Get an entity to evaluate that the user didn't evaluate yet 
 * but that has a solution
 * @param  {Integer}  family    Family id
 * @param  {Integer}  user      User id
 * @param  {Function} callback  Callback function  
 */
EntityManager.prototype.entityEvaluated = function(family, user, callback) {
  api.entity({
    // Filter by family
    family: family,
    // The given didn't evalute the entity before
    not_evaluated_by: user,
    // No solution given
    have_solution: "",
    // Get just 1 entity
    limit: 1,
  }).get(callback);
}


// Assure the manager object is a singleton.
global.JQUEST_ENTITY_MANAGER = global.JQUEST_ENTITY_MANAGER ? global.JQUEST_ENTITY_MANAGER : new EntityManager();

// The module exports a singleton instance of the TweetManager class so the
// instance is immediately available on require(), and the prototype methods
// aren't a part of the object namespace when inspected.
module.exports = global.JQUEST_ENTITY_MANAGER;