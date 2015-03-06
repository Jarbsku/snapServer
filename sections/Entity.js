var Physics = require('./objects/Physics.js');

var IdCounter = 0;

module.exports = function(x, y, hasPhysics, normalCollision, damageCollision){ //hasPhysics = boolean. If true entity has physics
	
	this.x = x;
	this.y = y;
	this.id = IdCounter;
	IdCounter++;
	this.imageId = 0;
	
	this.deltaX = 0;
	this.deltaY = 0;
	
	this.size = 16;
	
	this.sendMe = false;
	this.inputLocked = false;
	
	this.normalCollision = normalCollision;
	this.damageCollision = damageCollision;
	
	if(hasPhysics){
		this.physics = new Physics(this);
	}else{
		this.physics = null;
	}
	// feel free to override with function
	this.collisionCallback = null;
	// test if collision with target !entity!.
	// target can be entity or damage
	this.testCollision = function(target, isDamage) {

			if( ((this.x + this.deltaX)+(this.size / 2)) > (target.x - (target.size / 2)) && 
			((this.x + this.deltaX)-(this.size / 2)) < (target.x + (target.size / 2)) &&
			((this.y + this.deltaY)+(this.size / 2)) > (target.y - (target.size / 2)) && 
			((this.y + this.deltaY)-(this.size / 2)) < (target.y + (target.size / 2))){
				if(target.collisionCallback) {
					target.collisionCallback(this);
				}
				return true;
			}
			else {
				return false;
			}

	}

}