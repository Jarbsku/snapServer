var Entity = require('../Entity.js');
var Damage = require('./Damage.js');


module.exports = function(x, y, socket) {

	this.entity = new Entity(x, y, true, true, true);
	this.move = 's';
	this.socket = socket
	
	this.equipmentChanged = false;
	
	var inventory = [];
	var equipped = {head: 0, body: 0, legs: 0, weapon: 0};
	
	this.entity.physics.speed = 1.5;
	
	this.desiredSection = [0,0];
	this.currentSection = [0,0];
	/*var strength = 200;
	var facing = 'r';
	
	this.hitDelay = 500;*/

	/* players update is ran at each frame. 
		Parameters: damages Array
	*/
	this.entity.teleport = function(sectionID) {
		//todo
		console.log(this.id + " wants to teleport to section"+sectionID);
		this.desiredSection = [sectionID[0], sectionID[1]];
		
	}
	
	this.update = function(damages) {
		
		if(!this.entity.inputLocked){
			
			//DEBUG
			if(this.move == 'i'){
				equipped.head = 50;
				this.equipmentChanged = true;
			}
			else if(this.move == 'o'){
				equipped.body = 51;
				this.equipmentChanged = true;
			}
			else if(this.move == 'p'){
				equipped.legs = 52;
				this.equipmentChanged = true;
			}
			else if(this.move == 'k'){
				
				equipped.head = 0;
				equipped.body = 0;
				equipped.legs = 0;
				this.equipmentChanged = true;
			}
				
			
			
			if (this.move == 'h') {
				console.log(this.move);
					var tempDamage = this.getDamage();
					this.entity.inputLocked = true;
					
					var that = this;
					
					this.entity.physics.hitTimeOut = setTimeout(function() {
						damages.push(tempDamage);
						this.entity.inputLocked = false;
						that.move = 's';
						that.entity.sendMe = true;
					}, this.hitDelay);
			}
			return true;
		}
		return false;
	}
	
	this.getEquippedItems = function(){
		return equipped;
	}

}