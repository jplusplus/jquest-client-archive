new (function(window, undefined) {

  var that = this;

  that.initElements = function() {
    that.el = {
      $main   : $("#main"),
      $footer : $("footer")
    };
  };

  that.adaptMenuLayout = function() {    
    $(".navbar:first").toggleClass("at-top", ! $(window).scrollTop() );
  };

  /**
   * Create an iscroll method to jquery if iscroll exists
   * @return {Boolean} True if success
   */
  that.createJqueryIscroll = function() {    
    if(typeof iScroll == "undefined") return false;
    return !! ($.fn.iScroll = function(options) {
      return $(this).each(function() { 
        $(this).data("iscroll", new iScroll(this, options) ); 
      });
    });
  };
  
  $(that.init = function() {      
    that.initElements();   

    that.adaptMenuLayout();
    $(window).on("scroll", that.adaptMenuLayout);
  
    // Add iScroll as a jquery plugin
    // If succed, create some iscroll instances
    that.createJqueryIscroll();

  });

})(window);