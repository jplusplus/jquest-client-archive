/**
 * @author Pirhoo
 * 
 */
 module.exports = function(sequelize, DataTypes) {

  // Check if DAO doesn't yet (do not duplocate the model !)
  var dao = sequelize.daoFactoryManager.getDAO("Instance");

  // Dao already exists, we stop here and return it
  if(dao) return dao;

  // Instance class
  var Instance = sequelize.define("Instance", {
    name : DataTypes.STRING,
    slug : DataTypes.STRING,
    host : DataTypes.STRING
  // Options  
  }, { underscored: false });

  return Instance;

}