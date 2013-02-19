$(window).load(function() {

  // Active popover on mission card
  $('.mission-card').popover({trigger: "hover"});

  if( $.fn.iScroll ) {

    var $cards   = $(".cards.verticaled"),
        $wrapper = $cards.find(".wrapper");

    // iScroll option
    var iScrollOptions =  { 
      hScrollbar: true,                               
      hScroll: true,                                     
      snap: ".vertical-mission-cards", 
      momentum: false,                                 
      scrollbarClass: 'iscrollbar',       
      hideScrollbar:true,                            
      fadeScrollbar:true                              
    };

    // Force the wrapper to keep its width
    $wrapper.css("width",  $wrapper.outerWidth() );
    // Resize its parent
    $cards.css("width", "auto");
    // Creates the iScroll instance    
    var $iscroll = $cards.iScroll(iScrollOptions).css("overflow", "visible") 
  }

  window.jsPlumb.bind("ready", function() {    

    // Use Canvas as default renderer
    //jsPlumb.setRenderMode(jsPlumb.CANVAS);
    
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
              strokeStyle:"#666"
            },
          });          
        }                  
      }
    });

  });

})