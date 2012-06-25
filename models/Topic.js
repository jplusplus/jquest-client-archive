/**
 * @author Pirhoo
 * @description
 *
 */
 module.exports = function(sequelize, DataTypes) {
	
 	// Check if DAO doesn't yet (do not duplocate the !)
	var dao = sequelize.daoFactoryManager.getDAO("Topic")
	,  User = sequelize.import(__dirname + "/User");

	// Defines Topic class	
	return dao || sequelize.define("Topic", {
		  position       : DataTypes.INTEGER
		, name           : DataTypes.STRING
		, description    : DataTypes.STRING
		, debit          : DataTypes.INTEGER
		, credit         : DataTypes.INTEGER
		, state          : {
											  type : DataTypes.STRING
											, len  : [0,10]
										  }
	// Foreign key to User
	}).belongsTo( User, {
		foreignKey: "author"
	});
}