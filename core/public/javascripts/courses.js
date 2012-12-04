new (function(window, undefined) {

	var that = this;

	that.initElements = function() {
		return that.el = {
			$myJourneyDynamic : $("#my-journey-dynamic"),
      $myJourneyEmpty   : $(".my-journey"),
      $myJourney 			  : $("#my-journey")
		};		
	};

	/**
	 * @function
	 * Init the arrows' positions between the chapter 
	 */
	that.initArrows = function() {

		if( ! that.el.$myJourney ) return false;

		// For each arrow
		that.el.$myJourney.find(".arrow[data-parent]:visible").each(function(i, arrow) {
			
			var $arrow = $(arrow)
			// Find the current chapter
			, $chapter = $arrow.parents(".chapter-card")
			// Finds the parent
			,  $parent = that.el.$myJourney.find(".chapter-card[data-id=" + $arrow.data("parent") + "]")
			// Finds the parent positions
			, parentPosition = {
				 	// Horizontal position
				 	horizontal : $parent.offset().left < $chapter.offset().left ? 
				 		"west"
				 		: 
				 		( $parent.offset().left > $chapter.offset().left ? "east" : "equal" )
				 	// Vertical position
				 	, vertical : $parent.offset().top  < $chapter.offset().top  ? 
				 		"north"
				 		:
				 		( $parent.offset().top > $chapter.offset().top ? "south" : "equal" )				 		
				};

			// Remove every class from the arrow and add the new ones
			$arrow.removeClass().addClass("arrow " + parentPosition.horizontal + " " + parentPosition.vertical);

		});

		return true;
	};


  that.initMyJourney = function() {

		if( ! that.el.$myJourneyEmpty ) return false;

    // If we detect an empty .my-journey element
    if( that.el.$myJourneyEmpty.length == 1 &&  that.el.$myJourneyEmpty.is(":empty") ) {
      
      // Gets the current course
      var course = that.el.$myJourneyEmpty.data("course");

      // Load the journey with AJAX
      that.el.$myJourneyEmpty.loading().load("/courses/"+course+" #my-journey .span5", function() {   

        var chaptersCount = that.el.$myJourneyEmpty.find(".span5").length,
            chaptersWidth = that.el.$myJourneyEmpty.find(".span5").outerWidth();

        that.el.$myJourneyEmpty.css("width", (chaptersCount + 1) * chaptersWidth);

        that.initElements();  

        if( $.fn.iScroll ) {

          // iScroll option
          var iScrollOptions =  { 
            hScrollbar: true, 
            hScroll: true, 
            snap: "li", 
            momentum: false, 
            scrollbarClass: 'iscrollbar', 
            hideScrollbar:true,
            fadeScrollbar:true
          };

          // Creates the iScroll instance
          var $iscroll = that.el.$myJourneyDynamic.iScroll(iScrollOptions).css("overflow", "visible"),
               $lastEl = that.el.$myJourneyDynamic.find("li:not(.disabled):last");       

          $iscroll.data("iscroll").scrollToElement( $lastEl[0], 0 );
        }

      });

    }
    
  };
	
	$(that.init = function() {	
		
		that.initElements();	
		that.initArrows();
    that.initMyJourney();

		$(window).resize(that.initArrows);
	});

})(window);