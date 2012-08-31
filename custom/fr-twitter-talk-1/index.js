// Dependencies
var util      = require("util")
, MissionQuiz = require("jquest-mission").MissionQuiz;

module.exports = function(models, userId, chapterId, callback) {

  var self = this;

  // Change the template directory name
  self.templateDirname = __dirname;

  // Add several questions 

  self.addQuestion(function(callback) {
    callback({
      question: "Quel est le nom de l'auteur de ce Tweet ?",
      solution: "Pierre Romera",
      answers : ["Pierre Romera", "Nicolas Kayser-Bril", "Anne-lise Bouyer", "Bertrand De Vericourt"]
    });
  });

  self.addQuestion(function(callback) {
    callback({
      question: "Quel est le sujet de ce Tweet ?",
      solution: "Football",
      answers : ["Basketball", "Kung-Fu", "Football", "Surf"]
    });
  });

  self.addQuestion(function(callback) {
    callback({
      question: "Ce tweet est-il un RT ?",
      solution: "Oui",
      answers : ["Oui", "Non"]
    });
  });

  // Call the parent constructor
  module.exports.super_.call(self, models, userId, chapterId, callback);

};

/**
 * Inheritance from "MissionQuizz"
 */
util.inherits(module.exports, MissionQuiz);


/**
* Checks the advancement of the user
* @return {Boolean}   Returns true if the mission is completed
*/
module.exports.prototype.isCompleted = function() {
  return true; 
};


exports = module.exports;