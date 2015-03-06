/*
	Section is a part of the whole world with its own logic and objects.
*/

var Tile = require('./objects/Tile.js');
var RigidObject = require('./objects/RigidObject.js');
var fs = require('fs');
var Sender = require('../Sender.js');

var MAX_PLAYERS = 50;
var MAX_OBJECTS_PER_FRAME = 10;

var sender = new Sender();

global.knockBackingObjects = [];

/*swapSection = function which takes 3 parameters: sectionIdY, sectionIdX and player*/
module.exports = function(sectionID, io, dayTime, swappers){ 

	// PRIVATE OBJECTLISTS
	// Contains all tiles in this section
	var tiles = [];
	var rigidObjects = [];
	//Contains all damageobjects in this section
	var damages = [];
	
	//console.log(this.sectionSwapper);
	// PUBLIC OBJECTLISTS
	// Players are always sent to clients
	var players = [];

	// queue of objects that needs to be sent
	var objectQueue = [];
	var playerQueue = [];

	

	this.width = 0;
	this.height = 0;
	
	this.currentTimeOfDay = dayTime;
	
	var OBJECT_SIZE = 16;

	this.id = sectionID;
	this.io = io;

	var objectX = 0;
	var objectY = 0;
	
	// read map file and push tiles accordingly. If map file was not found, generate 16x16 map with no tiles
	{
		var content="";
		try {
			content = fs.readFileSync('./maps/'+sectionID, 'utf8');
			if(process.platform == "linux") {
				this.width = content.split('\n')[0].length;
			} else {
				this.width = content.split('\n')[0].length-1;
			}
			
			
			content = content.replace(/(\r\n|\n|\r)/gm,"");
			this.height = content.length / this.width;

			
		} catch (err){
			
			if(content === null){
				for(var i = 0; i < 256; i++){
		    		content += '0';
		    	}
		    	this.height = 16;
		    	this.width = 16;
			}
		}

		i = 0;

		for(var y = 0; y < this.height; y++) {
			for(var x = 0; x < this.width; x++) {

				var c = content.charAt(i);
				if(c > 0) {
					var obj = new Tile(objectX, objectY);
					obj.entity.imageId = c;
					if(c == 3) {//tree
						obj.entity.size = 8;
					} if(c == 9) {//teleport
						obj.entity.collisionCallback = function(entity) {
							if(entity.teleport) {
									for(var i = 0; i<players.length;i++){
										if(players[i].entity == entity){
											entity.teleport([0,1]);
											swappers.push(players[i]);
										}
									}
								}
							}
						}
					
					tiles.push(obj);
				}
		
				objectX += 16;
				i++;
			}
			objectX = 0;
			objectY += 16;
		}
		objectX = 0;
		objectY = 0;

	}

	setInterval(function(){sendCycle()}, 30);


	// initialize rigidobjects. move this to somewhere where it makes more sense.
	var rigid = new RigidObject(250,65);
	rigid.entity.sendMe = true;
	rigidObjects.push(rigid);
	
	rigid = new RigidObject(150,80);
	rigid.entity.sendMe = true;
	rigidObjects.push(rigid);
	
		rigid = new RigidObject(280,57);
	rigid.entity.sendMe = true;
	rigidObjects.push(rigid);
	
		rigid = new RigidObject(285,75);
	rigid.entity.sendMe = true;
	rigidObjects.push(rigid);
	/* 
		World uses this method to push player in this section
	 	Returns false if theres no room for new player
	*/
	this.pushPlayer = function(player){
		
		if(players.length < MAX_PLAYERS){
			player.equipmentChanged = true;
			//pushPlayer(player);
			players.push(player);
			this.sendSectionContent(player);
			return true;
		}else{
			return false;
		}
	};

	this.sendSectionContent = function(player) {
		
		console.log("Player connected and sending objects");
		sender.sendSectionInfo(this, player);
		sender.sendAllTiles(tiles, player);
		sender.sendAllPlayers(players,player);
		sender.sendHero(player);
		sender.sendAllRigidObjects(rigidObjects, player);
		console.log(players.length);
		console.log("Section info sent");

	};//done


	// Update logic of section. World calls this every frame.
	this.update = function(dayTime){
		
		if(this.currentTimeOfDay != dayTime){
			this.currentTimeOfDay = dayTime;
		}
		
		//playerMovement
		for(var i = 0; i < players.length; i++) {
			
			
			if(players[i].entity.physics.damageDetection(damages)) {
				players[i].entity.sendMe = true;
			}
			// check if player has changes in its equipment and add him to the send queue
			if(players[i].equipmentChanged){
				players[i].sendMe = true;
			}
			
			if(players[i].entity.physics){
				 
				// Player specific update. Uses damage array internally (player checks himself if damage should be taken)
				players[i].entity.physics.update(damages);// player update includes actions like hit and equipmentchange
					players[i].entity.physics.collisionDetection(tiles, this.width, this.height);
					players[i].entity.x += players[i].entity.deltaX;
					players[i].entity.y += players[i].entity.deltaY;
					if(players[i].entity.deltaX !== 0 || players[i].entity.deltaY !== 0) {
						players[i].entity.deltaX = 0;
						players[i].entity.deltaY = 0;
					
					//	pushPlayer(players[i]);
					}
				
			}
		}
	//	console.log(global.knockBackingObjects.length);
		// rigidObjects movement
		for(var i = 0; i < rigidObjects.length; i++) {
			if(rigidObjects[i].entity.physics.damageDetection(damages)) {
				rigidObjects[i].entity.sendMe = true;
			}
			if(rigidObjects[i].entity.physics && rigidObjects[i].entity.physics.knockback) {
				rigidObjects[i].entity.physics.update();
				rigidObjects[i].entity.physics.collisionDetection(tiles, this.width, this.height);
				rigidObjects[i].entity.x += rigidObjects[i].entity.deltaX;
				rigidObjects[i].entity.y += rigidObjects[i].entity.deltaY;
				if(rigidObjects[i].entity.deltaX !== 0 || rigidObjects[i].entity.deltaY !== 0) {
					rigidObjects[i].entity.deltaX = 0;
					rigidObjects[i].entity.deltaY = 0;
				
				//	pushPlayer(players[i]);
				}
				
			}
		}
		
		damages.forEach(function(d){
			d.ttl--;
			if(d.ttl <= 0){
				var i = damages.indexOf(d);
				damages.splice(i,1);
			}
		});
			
		//while(this.sendNextPlayer());
		
	};



	// call this for debug data of this section
	this.monitor = function() {
		console.log('----------');
		console.log('sektiossa: '+sectionID + '|Pelaajia: '+players.length+'kpl' +'|Jonossa objekteja: ' + playerQueue.length +'kpl');
	};

	this.removePlayer = function(player){
		var id = player.entity.id;
		
		var i = players.indexOf(player);
		var removedPlayer = players.splice(i,1);
		//sender.sendDisconnectMessage(players, id);
		return removedPlayer;
	};
	
	var sendCycle = function(){
		
		players.forEach(function(object){
			
			if(object.entity.sendMe){
				
				if(object.entity.physics.knockback){
					object.move = 'k';
					sender.sendKnockback(players, object);
				}else{
					sender.sendPlayer(players, object);	
				}
				
				object.entity.sendMe = false;
			}
			
		});
		rigidObjects.forEach(function(object) {
			
			if(object.entity.sendMe){
			//	console.log("<section.js> BALL " + object.entity.x + " " +object.entity.y);
				if(object.entity.physics.knockback){
					object.move = 'k';
					
					sender.sendKnockback(players, object);
				}else{
					sender.sendRigidObject(players, object);	
				}
				
				object.entity.sendMe = false;
			}
		})
	}
};