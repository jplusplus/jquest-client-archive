/**
 * @author Pirhoo
 * @description
 *
 */
 module.exports = function(sequelize, DataTypes) {

 	// Check if DAO doesn't yet (do not duplocate the !)
	var dao = sequelize.daoFactoryManager.getDAO("User");

	// User class
	return dao || sequelize.define("User", {
		  username	: DataTypes.STRING
		, password	: DataTypes.STRING
		, ugroup	  : {
										  type 	: DataTypes.STRING
										, len 	: [0,10]
								  }
		, email		  : {
									 	  type 		: DataTypes.STRING
										, isEmail	: true
								  }
	});

}