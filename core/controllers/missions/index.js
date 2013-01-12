var async = require('async')
 , config = require("config")
  , users = require("../users")
    , api = require("../../api")
      , _ = require("underscore");

// app global object
var app;

/**
 * @author Pirhoo
 * @description Chapters route binder
 *
 */
module.exports = function(_app) {  

  app = _app;

	/*
	 * GET chapters page.
	 */
	app.get('/:lang/m', function(req, res){

        if(res.locals.instance) {

            async.parallel({
                // Finds the isntance with the given id to extract the missions list
                instance : api.instance(res.locals.instance.id).get,
                // Finds the user progressions for this instance
                userProgressions : function(callback) {                    
                    if( req.isAuthenticated() ) {
                        api.user_progression({user: req.user.id}).get(callback)
                    } else {
                        //callback(null,false)
                        api.user_progression({user: 2}).get(callback)
                    }
                },
            }, function render(err, results) {
                
                // Switchs to the 404 page if an error happends
                if(err || !results.instance) return res.render('404');  
                
                // Create the mission three with missions mapping :
                //   1 - to record the user progression
                //   2 - to determines if the mission is activated
                //   3 - to extract its childrens
                //   4 - and map every children list to only keep resource_uri
                _.map(results.instance.missions, function(mission) {

                    // Merge Instance's missions with user progressions
                    if(results.userProgressions) {
                        // Filters the userProgressions array to this mission
                        mission.progression = _.find(results.userProgressions.objects, function(p) { 
                            return p.mission == mission.resource_uri;
                        });
                    } 

                    // Is the current missiona activated ?
                    //  1 - Yes, if no parent
                    mission.isActivated = mission.relationships.length == 0;
                    //  2 - Or not, if no user progression (loged out)
                    mission.isActivated = mission.isActivated || !results.userProgressions;
                    //  3 - Or yes, if one parent is succeed
                    mission.isActivated = mission.isActivated || !!_.find(mission.relationships, function(rs) {
                        // Find the user progession of each parent to its state
                        return !! _.find(results.userProgressions.objects, function(up) {                            
                            return rs.parent == up.mission && up.state == "succeed"
                        })
                    })

                    // Get childs number by fetch every missions' relationships
                    mission.children = _.filter(results.instance.missions, function(m) {
                        return _.find(m.relationships, function(rs) {
                            return rs.parent == mission.resource_uri;
                        });
                    });

                    // Pluck the resource uri
                    mission.children = _.pluck(mission.children, "resource_uri");

                })

                var missions = bfsCollapse(results.instance.missions, "resource_uri");                                
                // Overwrite the locals' instance attribut
                res.locals.instance.missions = missions;
                // Render on the course view
                res.render('missions/');

            });
        }
    });

};


/**
 * Tree collasping with Breadth-First transversal algorithm.
 * More information here: https://en.wikipedia.org/wiki/Breadth-first_search
 *
 * Demonstration (using A as root):
 *
 *   A                          A--0
 *  / \                         B--1
 * B   C         will begin     C--1
 *  \ / \                       D--2
 *   D   E                      E--3
 *    \                         F--4
 *     F
 *  
 * @param  {Object} graph Graph to fetch
 * @param  {String} key   Node key used to find the unique identifier
 * @param  {Object} root  Node where start the fetch
 * @return {Array}        Tree collasping
 */
var bfsCollapse = module.exports.bfsCollapse = function(graph, key, root) {

  // Mark a value in "marked" array
  function mark(l) {  
    return !isMarked(l) && marked.push(l);
  }

  // Check if a value is marked into "marked" array
  function isMarked(l) {
    return marked.indexOf(l) > -1;
  }

  // Fluture flatered version of the graph
  var flat = [],
  // Create a queue
     queue = [],
  // Create a list of marked node
    marked = [];

  // check and finds the root
  root = root || getRoot(graph);

  // Marks the root node
  mark(root[key]);
  // Add level 0 to the root node
  root.level = 0;
  // Puts the root node in the queue
  queue.push(root);

  // While the queue isn't empty
  while(!!queue.length) {
    // Removes and gets the first queue element 
    var node = queue.shift();
    // Save the node properties (cloning hack) 
    flat.push( JSON.parse( JSON.stringify(node) ) );
    // While there is children on the current node
    while(!!node.children.length) {
      // Removes and gets the first child
      child = node.children.shift();
      // Do the first child is marked ?
      if( ! isMarked(child) ) {
        // Marks it
        mark(child);        
        // Gets the full node (using its name)
        var obj = _.find(graph, function(n) { return n[key] == child; });        
        // if we find an object
        if(obj) {
          // Add the level count to the object
          obj.level = node.level+1
          // Push the full node into the queue
          queue.push(obj);        
        }     
      }
    }
  }  

  return flat;
}

/**
 * Get the first node of the graph without parent
 * @param  {Object} graph Graph to fetch
 * @return {Object}       The graph's root
 */
var getRoot = module.exports.getRoot = function(graph) {

  return _.find(graph, function(n) {
    return typeof n.relationships  == "undefined" || n.relationships.length === 0;
  });

}