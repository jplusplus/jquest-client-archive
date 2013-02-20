var fermata = require("fermata");
var config  = require("config");

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

module.exports = api[config.api.version];