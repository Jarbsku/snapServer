var Knockback = require('./Knockback.js');
var Damage = require('./Damage.js');

module.exports = function(entity) {
    
        /*public variables*/
        this.speed = 1;
        this.move = 's';
        this.facing;
        
        this.Knockback = null;
        this.entity = entity;
        this.hitTimeOut;
        
        this.hitDelay = 500;
        /*private variables*/
        var facing = 'r';
        var strength = 10;

        this.attachKnockback = function(knockback){
                
                this.knockback = knockback;
        }
        
        this.update = function(damages){
            /*IF KNOCKBACK IS ATTACHED THEN IT'S UPDATE WILL OVERRIDE NORMAL UPDATE UNTIL KNOCKBACK IS OVER*/
            if(this.knockback){
            	            	//lock player input for the duration of knockback
            	if(!this.entity.inputLocked){
            		this.entity.inputLocked = true;
            	}
            	
                if(this.knockback.isDone()){
                	global.knockBackingObjects.splice(this.entity,10);
                	this.knockback = null;
                	this.entity.inputLocked = false;
                	this.entity.sendMe = true;
                }else{
                	this.knockback.update();
                }
                
                
            }
            
            if(!this.entity.inputLocked){ 
            	
            	
            //	console.log("player can move! id:"+this.entity.id+" move:"+this.move);
                if(this.move != 's'){
                    
                    if (this.move == 'l') {
        				this.entity.deltaX = -this.speed;
        				facing = 'l';
        			}
        			else if (this.move == 'r') {
        				this.entity.deltaX = this.speed;
        				facing = 'r';
        			}
        			else if (this.move == 'd') {
        				this.entity.deltaY = this.speed;
        				facing = 'd';
        			}
        			else if (this.move == 'u') {
        				this.entity.deltaY = -this.speed;
        				facing = 'u';
        			}
  					
  					//return true; //old return
                
                }
                
                if (this.move == 'h') {
					var tempDamage = this.getDamage();
					this.entity.inputLocked = true;
					
					
					var that = this;
					
					this.entity.physics.hitTimeOut = setTimeout(function() {
						damages.push(tempDamage);
						that.entity.inputLocked = false;
						if(that.move == 'h') {
							that.move = 's';
						}
						that.entity.sendMe = true;
					}, 500);
				}
				
				return true;
                
            }  
            return false;
        }
        
        this.collisionDetection = function(collidableArray, width, height) {
		// test section corners
		if (((this.entity.x + this.entity.deltaX) - (this.entity.size / 2)) < 0) {
			this.entity.deltaX = 0;
			this.move = 's';
			this.entity.sendMe = true;
		}
		else if (((this.entity.x + this.entity.deltaX) + (this.entity.size / 2)) > width * this.entity.size) {
			this.entity.deltaX = 0;
			this.move = 's';
			this.entity.sendMe = true;
		}
		else if (((this.entity.y + this.entity.deltaY) - (this.entity.size / 2)) < 0) {
			this.entity.deltaY = 0;
			this.move = 's';
			this.entity.sendMe = true;
		}
		else if (((this.entity.y + this.entity.deltaY) + (this.entity.size / 2)) > height * this.entity.size) {
			this.entity.deltaY = 0;
			this.move = 's';
			this.entity.sendMe = true;
		}
		

		// test tiles
		for (var i = 0; i < collidableArray.length; i++) {
				
				if (this.entity.testCollision(collidableArray[i].entity)) {
					
					/*If object with knockback running collides with collidable object 
					it will change the direction of current running knockback to opposite*/ 
					if(this.knockback) {
						
						switch(this.knockback.direction) {
							case 'u':
				                this.knockback.direction = 'd';
				                break;
				            case 'd':
				                this.knockback.direction = 'u';
				                break;
				            case 'l':
				                this.knockback.direction = 'r';
				                break;
				            case 'r':
				                this.knockback.direction = 'l';
				                break;
	                
						}
					} 
						
					this.entity.deltaX = 0;
					this.entity.deltaY = 0;
					this.move = 's';
					this.entity.sendMe = true;
				
				}
			
			}
		// test knockbacking objects
		if(!this.knockback) {
		
			global.knockBackingObjects.forEach(function(object) {
				if(this.entity.testCollision(object)) {
					this.knockback = new Knockback(this.entity, object.physics.knockback.force, object.physics.knockback.direction);

					this.entity.sendMe = true;
				}	
			},this);
		} 
	}
	
	this.setMove = function(move){
		
		if(this.move != move && !this.entity.inputLocked){
			this.move = move;
			this.entity.sendMe = true;
		}
		
	}
	
	this.damageDetection = function(damages) { // collidable array otetaan pois 
		
		for (var i = 0; i < damages.length; i++) {
			var force = damages[i].damage;

			
			if (this.entity.testCollision(damages[i], true) && damages[i].sourceId != this.entity.id) {
			//	console.log("<from physics> you hit: " + this);
				
				this.knockback = new Knockback(this.entity, force, damages[i].direction);
				//	console.log(this.knockback);
				
				clearTimeout(this.hitTimeOut);
				this.entity.inputLocked = false;
				return true;
			}
			return false;
		}
	}
	
	this.getDamage = function() {
		
		var position = {
			x: this.entity.x,
			y: this.entity.y
		};

		switch (facing) {
			case 'l':
				position.x -= (this.entity.size);
				break;
			case 'r':
				position.x += (this.entity.size);
				break;
			case 'u':
				position.y -= (this.entity.size);
				break;
				//down
			default:
				position.y += (this.entity.size);
		}

		var damage = new Damage(strength, position, facing, 2, 3, null, this.entity.id);

		return damage;
	}
        
}