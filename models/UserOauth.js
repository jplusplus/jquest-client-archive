/**
 * @author Pirhoo
 * @description
 *
 */
 module.exports = function(sequelize, DataTypes) {
		
 	// Check if DAO doesn't yet (do not duplocate the !)
	var dao = sequelize.daoFactoryManager.getDAO("UserOauth")
	,  User = sequelize.import(__dirname + "/User");

	// Defines UserOauth class
	return dao || sequelize.define("UserOauth", {
		  consumer 								: DataTypes.STRING
		, consumerUserId					: DataTypes.INTEGER
		, oauthAccessToken  			: DataTypes.STRING
		, oauthAccessToken_secret	: DataTypes.STRING
	// Foreign key to User
	}).belongsTo( User, {
		foreignKey: "userId"
	});
}