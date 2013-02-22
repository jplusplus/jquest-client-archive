var api = require("./api.js");

function EntityManager() {

}

/**
 * Add an entity to the database
 * @param {Object}          entity  Entity object
 * @param {String}          fid     Identifier of the entity in its family   
 * @param {Integer|String}  family  Family identifier (id or resource uri)
 */
EntityManager.prototype.add = function(entity, fid, family, callback) {
    callback = callback || function() {};
    var data = { 
        // Stringify the entity
        body: JSON.stringify(entity), 
        // Specify the entity id (from its provider) to avoid duplicates
        fid: fid,
        // Specify the family (Tweet, FB update, etc)
        family: family
    };
    api.entity.post(data, callback);
};


// Assure the manager object is a singleton.
global.JQUEST_ENTITY_MANAGER = global.JQUEST_ENTITY_MANAGER ? global.JQUEST_ENTITY_MANAGER : new EntityManager();

// The module exports a singleton instance of the TweetManager class so the
// instance is immediately available on require(), and the prototype methods
// aren't a part of the object namespace when inspected.
module.exports = global.JQUEST_ENTITY_MANAGER;