var Entity = require('../Entity.js');
var Damage = require('./Damage.js');


module.exports = function(x, y) {

	this.entity = new Entity(x, y, true, false, true);
	this.entity.imageId = 5;
	this.entity.physics.speed = 1.5;
	
	this.update = function(damages) {

		
		return false;
	}
	


}