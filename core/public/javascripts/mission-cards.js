$(function() {

  window.jsPlumb.bind("ready", function() {    

    // Use Canvas as default renderer
    jsPlumb.setRenderMode(jsPlumb.SVG);
    jsPlumb.importDefaults({
      ConnectorZIndex:10
    });

    // Create the pumb of each card
    $(".mission-card").each(function() {
      // The mission to go from
      $source = $(this);
      // The mission's children in an array
      var children = String( $source.data("children") ).split(",");
      // For each mission's child...
      for(var p in children) {      
        // gets the child's uri...
        var uri = children[p],
        // and found the matching card?
        $child = $(".mission-card").filter("[data-uri='" + uri + "']")      
        // If card exists
        if($child.length > 0) {
          // Create the connection
          jsPlumb.connect({ 
            source: $source, 
            target: $child,          
            connector:"Flowchart",
            anchors:["Center", "Center"],  
            endpointStyle:"Blank",
            paintStyle:{             
              lineWidth:1, 
              strokeStyle:"#222"
            },
          });          
        }                  
      }
    });

  });

})