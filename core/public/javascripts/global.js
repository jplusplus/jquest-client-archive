new (function(window, undefined) {

  var that = this;

  that.initElements = function() {
    that.el = {
      $main   : $("#main"),
      $footer : $("footer")
    };
  };

  that.adaptMainHeight = function() {
    //that.el.$main.css("min-height", $(window).height() - that.el.$footer.outerHeight() - that.el.$main.css("padding-bottom")  );
  };

  that.adaptMenuLayout = function() {    
    $(".navbar:first").toggleClass("at-top", ! $(window).scrollTop() );
  };
  
  $(that.init = function() {      
    that.initElements();   

    that.adaptMenuLayout();
    $(window).on("scroll", that.adaptMenuLayout);

    that.adaptMainHeight();
    $(window).on("resize", that.adaptMainHeight);

  });

})(window);