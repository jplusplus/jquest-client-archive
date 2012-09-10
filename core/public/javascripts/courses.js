new (function(window, undefined) {

	var that = this;

	that.initElements = function() {
		return that.el = {
			$chapters  			: $("#chapters"),
      $myJourneyEmpty : $(".my-journey"),
      $myJourney 			: $("#my-journey")
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
			, $chapter = $arrow.parents(".chapter")
			// Finds the parent
			,  $parent = that.el.$chapters.find(".chapter[data-id=" + $arrow.data("parent") + "]")
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
      that.el.$myJourneyEmpty.loading().load("/courses/"+course+" #my-journey", function() {      	
				that.initElements();	
				that.initArrows();
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