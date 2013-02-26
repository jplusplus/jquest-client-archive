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

	/*
	 * GET/POST Missions list and single page.
	 */
	app.all('/:lang/m/:id?/:action?', missionPage);

};

/**
 * List all missions and get 1 mission details if asked
 * @param  {Object} req Request object
 * @param  {Object} res Request object
 */
var missionPage = module.exports.missionPage = function(req, res){

    if(res.locals.instance) {

        async.parallel({
            // Finds the isntance with the given id to extract the missions list
            instance : api.instance(res.locals.instance.id).get,
            // Finds the user progressions for this instance
            userProgressions : function(callback) {                    
                if( req.isAuthenticated() ) {
                    api.user_progression({user: req.user.id}).get(callback)
                } else {
                    callback(null,false)                        
                }
            },
            // Finds the current mission (if needed)
            mission: function(callback) {
              if(! req.params.id) return callback(null, null);
              else api.mission(1*req.params.id).get(callback);
            }
        }, function render(err, locals) {
            
            // Switchs to the 404 page if an error happends
            if(err || !locals.instance) return res.render('404');  
            
            // Create the mission three with missions mapping :
            //   1 - to record the user progression
            //   2 - to determines if the mission is activated
            //   3 - to extract its childrens
            //   4 - and map every children list to only keep resource_uri
            _.map(locals.instance.missions, function(mission) {

                // Merge Instance's missions with user progressions
                if(locals.userProgressions) {
                    // Filters the userProgressions array to this mission
                    mission.progression = _.find(locals.userProgressions.objects, function(p) { 
                        return p.mission == mission.resource_uri;
                    });
                }

                // Is the current mission activated ?
                //  1 - Yes, if no parent
                mission.isActivated = mission.relationships.length == 0;
                //  2 - Or not, if no user progression and the current is the root (loged out)
                mission.isActivated = mission.isActivated || (!locals.userProgressions && !mission.relationships.length)
                //  3 - Or yes, if one parent is succeed
                mission.isActivated = mission.isActivated || !!_.find(mission.relationships, function(rs) {
                    // Find the user progession of each parent to its state
                    return !! _.find(locals.userProgressions.objects, function(up) {                            
                        return rs.parent == up.mission && up.state == "succeed"
                    })
                })

                // Get childs number by fetch every missions' relationships
                mission.children = _.filter(locals.instance.missions, function(m) {
                    return _.find(m.relationships, function(rs) {
                        return rs.parent == mission.resource_uri;
                    });
                });

                // Pluck the resource uri
                mission.children = _.pluck(mission.children, "resource_uri");                
            });


            var missions = bfsCollapse(locals.instance.missions, "resource_uri");                                
            // Overwrite the locals' instance attribut
            locals.instance.missions = missions;
            // No single one mission given, renders on the misson list view
            if(!locals.mission) return res.render('missions/index', locals);            

            // Additional step for the Mission screen in an other router function
            // *****************************************************************
            missionRouter(req, res, locals);
        });
    }
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
 *   D   E                      E--2
 *    \                         F--3
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

  // Future flatered version of the graph
  var flat = [],
  // Creates a queue
     queue = [],
  // Creates a list of marked node
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

/**
 * Get a mission instance for the given user and mission
 * @param  {Number} user
 * @param  {String} mission
 * @param  {Function} callback
 */
var getMissionModule = module.exports.getMissionModule = function(user, mission, callback) {

  // Create the missions array if unexists
  if(typeof app.missionModules == "undefined") app.missionModules = [];  

  // Looks for the mission for this mission and user
  var module = _.findWhere(app.missionModules,  {user:  user.id, mission: mission.id});

  // If we didn't find the mission
  if(module === undefined) {
    
    // Is the mission class available ?
    if(app.missions[mission.package]) {      
      // Instances the mission 
      // (uses the chapter slug to find the good one) 
      // and call the render callback
      module = new app.missions[mission.package](api, entityManager, user.id, mission.id, function(err) {  
        // Add this instance to the list of available instances
        if(!err) app.missionModules.push(module);     
        // Callback function
        callback(err, module);
      });

    } else callback({error: "Mission's package missing."}, null)

  } else {  
    // Callback function
    callback(null, module);
  }

}


/**
 * Second router for mission screen that adapt the rendering
 * to the mission state and user action (param :action)
 * @param  {Object} req    User HTTP request
 * @param  {Object} res    User HTTP result
 * @param  {Obkect} locals Template local variables 
 */
function missionRouter(req, res, locals) {

  // Do not go further if the User isn't authenticated
  if(! req.isAuthenticated() ) return res.redirect("u/login");

  // Get the mission module
  getMissionModule(req.user, locals.mission, function(err, module) {

    // Saves the mission module
    if(module) locals.mission.module = module;

    switch(err || req.params.action) {
      
      case "open":
        module.open(function() {
          // Once the mission is open,
          // redirect to the play screen
          res.redirect("../play")
        });
        break;

      case "play":
        // Prepare the mission to play before rendering
        module.play(function(err, question) {          
          locals.question = question;   
          res.render('missions/mission', locals);
        });
        break;
      
      
      case "data":
        // Receive data to evaluate throw the request body
        module.data(req.body, function(err, results) {          
          res.json(err || results);
        });
        break;
      
      case "get":
        // Receive data request
        module.get(req.query, function(err, results) {          
          res.json(err || results);
        });
        break;

      case "info":
        // Nothing yet.
        // Do not break to continue until the default statement.
      
      default:
        res.render("404");
        break;
    }

  }); 


}