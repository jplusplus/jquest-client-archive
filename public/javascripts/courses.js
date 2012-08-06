(function(window, undefined) {

	var that = this;

	that.initElements = function() {
		that.el = {
			$chapters : $("#chapters")
		};
	};

	/**
	 * @function
	 * Init the arrows' positions between the chapter 
	 */
	that.initArrows = function() {

		// For each arrow
		that.el.$chapters.find(".arrow[data-parent]:visible").each(function(i, arrow) {
			
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
	};
	
	$(that.init = function() {	
		
		that.initElements();	

		that.initArrows();
		$(window).resize(that.initArrows);
	});

})(window);