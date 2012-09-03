(function(window, undefined) {

  var that = this;

  that.initElements = function() {
    that.el = {
      $mission      : $("#mission"),
      $splashscreen : $("#mission .splashscreen"),
      $countdown    : $("#mission .question-countdown"),
      $countdownBar : $("#mission .question-countdown .progress .bar"),
      $countdownTime: $("#mission .question-countdown .time")
    };
  };

  that.showSolution = function(solution) {

    // Find the checked input
    var $checked = that.el.$mission.find("input[name=quiz-answer]:checked")
    // Find the input with the solution
     , $solution = that.el.$mission.find("input[name=quiz-answer]").filter(function() {
        return $.inArray($(this).val(), solution) > -1;
     });

    // Disabled all inputs
    that.el.$mission.find("input,button,.btn").addClass("disabled").prop("disabled", true);

    // Toggle the classes on the btn
    $solution.parents(".btn").addClass("btn-success");
    $checked.parents(".btn").toggleClass("btn-danger",  ! $checked.hasClass("btn-success") );
  };

  that.newQuestion = function() {

    // Ajax loading of the new mission.    
    that.el.$mission.load(" #mission > *", function() {
      that.initElements();
      that.hideSplashscreen();
      that.startQuestionCountdown();
    });

  };

  that.hideSplashscreen = function() {
    that.el.$mission.find(".splashscreen").addClass("hide");
  }


  that.updateSplashscreen = function(secondsLeft) {
    
    // Hides the splashscreen if no seconds left
    if(secondsLeft === 0) {
      
      that.hideSplashscreen();
      // And start the question countdown
      that.startQuestionCountdown();

    // Or updates it
    } else {
    
      // Gets the messages to parse
      // from splashscreen data
      var msgSingle = that.el.$splashscreen.data("msg-cd-single"),
          msgPlural = that.el.$splashscreen.data("msg-cd-plural"),
                msg = secondsLeft === 1 ? msgSingle : msgPlural;

      // Update the splashscreen
      that.el.$splashscreen.find(".countdown").html( msg.replace("%", secondsLeft) );

      // Remove the splashscreen in a few second
      setTimeout(function() { that.updateSplashscreen(secondsLeft-1) }, 1000);
    }
  };

  that.updateQuestionCountdown = function(secondsLeft) {
     
    // Gets the duration of the question
    var duration = that.el.$countdown.data("duration"),
    // Update's frequency according the duraction
       frequency = duration*10 > 500 ? 500 :   duration*10, 
    // Decrease of...
        decrease = 1 / (1000/frequency),
    // Computes the minutes left
         minutes = ~~(secondsLeft/60),
    // Computes the seconds left
         seconds = ~~secondsLeft - 60*minutes;        

    // Adds a "zero" prefix
    if(minutes < 10) minutes = "0" + minutes;
    if(seconds < 10) seconds = "0" + seconds;

    // Update the countdown's progress bar
    that.el.$countdownBar.css("width", 100-(secondsLeft-1)/   duration*100 + "%");
    // Update the countdown's time
    that.el.$countdownTime.html(minutes + ":" + seconds);
    
    // The time to answer is over,
    // we force the submition. 
    // For the system, the answer will be incorrect.
    if(secondsLeft <= 0) that.el.$mission.trigger("submit");
    // Or updates it
    else {   
      that.countdownTimeout = setTimeout(function() { that.updateQuestionCountdown(secondsLeft-decrease) }, frequency);
    }
  };


  that.startQuestionCountdown = function() {

    // Gets the duration of the question
    var duration = that.el.$countdown.data("duration");
  
    // Saves the current date
    that.startTime = new Date();


    // if the duraction is valid
    if( duration ) {
      // Update the question countdown
      // to launch the refreshing.
      // We add a second of transition.
      that.updateQuestionCountdown(duration+1);
    }
  };


  that.submitForm = function(e) {
    
    // Disables the sending of the data (and page loading)
    e.preventDefault();

    // Stop the countdown
    if(that.countdownTimeout) clearTimeout(that.countdownTimeout);

    // Shortcut
    var $form = that.el.$mission;
    
    // Gets the whole form's values
    // BEFORE loading mode that disabled input        
    var values = {};
    $.each( $form.serializeArray(), function(i, field) {
      values[field.name] = field.value;
    });

    // The time to answer to the question
    if(that.startTime) {
      // Seconds convertion
      values.duration = new Date().getTime() - that.startTime.getTime();
      values.duration = ~~values.duration/1000;
    }

    // launch "loading mode" on the mission
    $form.loading();

    // Send the values to know 
    // if the user is correct
    $.post("", values, function(data) {
      
      // remove "loading mode" on the mission
      $form.loading(false);

      // Show the solution
      that.showSolution(data.solution);

      // Wait a few seconds
      setTimeout(function() {
        // There is questions left, pass to a new question
        if( ! data.isComplete ) that.newQuestion();
        // Reload the page to display the final one
        else window.location.reload()
      }, 3000);

    }, "json");

  };

  
  $(that.init = function() {    

    that.initElements();  

    // Remove the splashscreen in a few second
    if(that.el.$splashscreen.length) setTimeout(function() { that.updateSplashscreen(4) }, 1000);

    // Auto-submit for the quiz forms
    that.el.$mission.on('change', function() {        
      that.el.$mission.submit();
    });

    // Behavior different following 
    // the type of the question (quiz)
    // and the state of the mission (game)
    if( that.el.$mission.data("type")  === "quiz" 
    &&  that.el.$mission.data("state") === "game") {

      // When we submit the form
      that.el.$mission.on('submit', function(e) { that.submitForm(e); });
    }

  });

})(window);