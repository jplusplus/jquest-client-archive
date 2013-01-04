/**
 * @author Pirhoo
 * 
 */
 module.exports = function(sequelize, DataTypes) {

  // Check if DAO doesn't yet (do not duplocate the model !)
  var    dao = sequelize.daoFactoryManager.getDAO("Mission")
  , Instance = sequelize.import(__dirname + "/Instance");
  
  // Defines Mission class
  return dao || sequelize.define("Mission", {
    name     : DataTypes.STRING,
    excerpt  : DataTypes.TEXT,   
    media    : DataTypes.INTEGER
  // Options
  }, { underscored: false })
  // Foreign key to Instance
  .belongsTo( Instance, {
    foreignKey: "instance"
  });
};