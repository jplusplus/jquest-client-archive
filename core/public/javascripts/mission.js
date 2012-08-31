(function(window, undefined) {

  var that = this;

  that.initElements = function() {
    that.el = {
      $mission : $("#mission")
    };
  };
  
  $(that.init = function() {    
    that.initElements();  

    // Auto-submit for the quiz forms
    that.el.$mission.on('change', function() {
      if( $(this).data("type") === "quiz" ) $(this).submit();
    });

  });

})(window);