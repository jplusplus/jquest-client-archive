/**
 * @author Pirhoo
 * 
 */
 module.exports = function(sequelize, DataTypes) {

  // Check if DAO doesn't yet (do not duplocate the model !)
  var   dao = sequelize.daoFactoryManager.getDAO("MissionRelationship")  
  , Mission = sequelize.import(__dirname + "/Mission");

  // Defines MissionRelationship class
  return dao || sequelize.define("MissionRelationship", { }, { underscored: false, timestamps: false })
  // Foreign keys
  .belongsTo( Mission, { foreignKey: "mission" })
  .belongsTo( Mission, { foreignKey: "child" });

};