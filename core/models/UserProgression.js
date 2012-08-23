/**
 * @author Pirhoo
 * 
 */
 module.exports = function(sequelize, DataTypes) {

 	// Check if DAO doesn't yet (do not duplocate the model !)
	var dao = sequelize.daoFactoryManager.getDAO("UserProgression")
	// Model dependencie for that is a foreign key
	,  User = sequelize.import(__dirname + "/User");

	// Dao already exists, we stop here and return it
	if(dao) return dao;

	// UserProgression class
	var UserProgression = sequelize.define("UserProgression", {
		  // Pseudo-foreign-key refering to a chapter in the external db
		  chapterId : { type: DataTypes.INTEGER, primaryKey: true }			
			// Foreign key to User
		, userId 	  : { type: DataTypes.INTEGER, primaryKey: true }		
			// Total point for this record		  
		, points		: DataTypes.INTEGER
	});

	// Foreign key to User
	User.hasMany(UserProgression,  {foreignKey:'userId'});

	return UserProgression;

}