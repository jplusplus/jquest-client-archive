function EntityManager() {

}

// Assure the manager object is a singleton.
global.JQUEST_ENTITY_MANAGER = global.JQUEST_ENTITY_MANAGER ? global.JQUEST_ENTITY_MANAGER : new EntityManager();

// The module exports a singleton instance of the TweetManager class so the
// instance is immediately available on require(), and the prototype methods
// aren't a part of the object namespace when inspected.
module.exports = global.JQUEST_ENTITY_MANAGER;