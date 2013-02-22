var fermata = require("fermata");
var config  = require("config");

function ApiManager() {

    /**
     * Fermata plugin to support tail slash on REST API
     */
    fermata.registerPlugin("slashed", function (transport, baseURL) {

        this.base = baseURL;                            
        transport = transport.using('statusCheck').using('autoConvert', "application/json");        

        return function (request, callback) {                        
            // If the last caracter of the path isn't a slash
            if( String(request.path[request.path.length - 1]).substr(-1,1) !== "/") {
                // Automatically adding a tail slash to the URL's end
                request.path.push("");
            }

            transport(request, callback);
        };
    });

    // Creates the api client
    var api = fermata.slashed(process.env.API_URL || config.api.url);

    return api[config.api.version];
}


// Assure the manager object is a singleton.
global.JQUEST_API_MANAGER = global.JQUEST_API_MANAGER ? global.JQUEST_API_MANAGER : new ApiManager();

// The module exports a singleton instance of the ApiManager class so the
// instance is immediately available on require(), and the prototype methods
// aren't a part of the object namespace when inspected.
module.exports = global.JQUEST_API_MANAGER;