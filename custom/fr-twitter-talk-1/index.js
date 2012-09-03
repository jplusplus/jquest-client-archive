// Dependencies
var util      = require("util")
, MissionQuiz = require("jquest-mission").MissionQuiz;

module.exports = function(models, userId, chapterId, callback) {

  var self = this;

  // Add several questions 
  // 
  self.addQuestion(function(callback) {
    callback({
      content : "",
      duration: 10,
      label   : "Quel est le nom de l'auteur de ce Tweet ?",
      solution: "Pierre Romera",
      answers : ["Pierre Romera", "Nicolas Kayser-Bril", "Anne-lise Bouyer", "Bertrand De Vericourt"]
    });
  });

  self.addQuestion(function(callback) {
    callback({
      label   : "Quel est le sujet de ce Tweet ?",
      duration: 10,
      solution: "Football",
      answers : ["Basketball", "Kung-Fu", "Football", "Surf"]
    });
  });

  self.addQuestion(function(callback) {
    callback({
      label   : "Ce tweet est-il un RT ?",
      //duration: 20,
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


exports = module.exports;