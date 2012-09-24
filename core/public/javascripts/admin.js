new (function(window, undefined) {

  var that = this;

  that.initElements = function() {
    that.el = {
      $fullScreenIframe : $(".fullScreenIframe")
    };
  };


  $(window).on("resize", that.resize = function() {

    that.el.$fullScreenIframe.each(function(i, el) {
      var $el = $(el);
      $el.css({
        width:"100%",
        border:0,
        height: $(window).height() - $el.offset().top - 4
      })
    });

  });

  
  $(that.init = function() {      
    that.initElements();
    that.resize();

  });

})(window);