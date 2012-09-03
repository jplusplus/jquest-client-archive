// Dependencies
var util      = require("util")
, MissionQuiz = require("jquest-mission").MissionQuiz;

module.exports = function(models, userId, chapterId, callback) {

  var self = this;

  // Add several questions 
  // 
  self.addQuestion(function(callback) {
    callback({
      label   : "Quel est le hashtag utilisé ?",
      duration: 10,
      solution: ["Techno", "Apple"],
      answers : ["Techno", "Sympatico_ca", "Apple", "Samsung"]
    });
  });

  /*
  self.addQuestion(function(callback) {
    callback({
      content : "",
      duration: 10,
      label   : "Quel est le nom d'utilisateur de l'auteur de ce Tweet ?",
      solution: "nicolaskb",
      answers : ["Pierre Romera", "verycourt", "Anne-lise Bouyer", "nicolaskb"]
    });
  });

  self.addQuestion(function(callback) {
    callback({
      label   : "À quel thème se rapporte ce Tweet ?",
      duration: 10,
      solution: "Football",
      answers : ["Euro2012", "lequipe", "Football", "Retweet"]
    });
  });

  self.addQuestion(function(callback) {
    callback({
      label   : "Ce tweet est-il un Retweet ?",
      duration: 10,
      solution: "Oui",
      answers : ["Oui", "Non"]
    });
  });

  self.addQuestion(function(callback) {
    callback({
      label   : "Quel est le nombre d'abonnements de cet utilisateur ?",
      duration: 10,
      solution: "189",
      answers : ["189", "269", "36 190", "9 854"]
    });
  });

  self.addQuestion(function(callback) {
    callback({
      label   : "Quel est le nombre d'abonnés de cet utilisateur ?",
      duration: 10,
      solution: "36 190",
      answers : ["189", "269", "36 190", "9 854"]
    });
  });


  /* self.addQuestion(function(callback) {
    callback({
      label   : "A qui est destiné ce tweet ?",
      duration: 10,
      solution: ["tomhanks"],
      answers : ["pirhoo", "tomhanks", "Freestars", "D. Francis D."]
    });
  });

  self.addQuestion(function(callback) {
    callback({
      label   : "Qui est mentionné dans ce tweet ?",
      duration: 10,
      solution: "justinbieber",
      answers : ["pirhoo", "tomhanks", "Freestars", "justinbieber"]
    });
  });

  self.addQuestion(function(callback) {
    callback({
      label   : "Quel est lʼidentifiant de cet utilisateur?",
      duration: 10,
      solution: "morandiniblog",
      answers : ["pirhoo", "morandiniblog", "620", "Journaliste Animateur"]
    });
  }); */


  // Call the parent constructor
  module.exports.super_.call(self, models, userId, chapterId, callback);

};

/**
 * Inheritance from "MissionQuizz"
 */
util.inherits(module.exports, MissionQuiz);


exports = module.exports;