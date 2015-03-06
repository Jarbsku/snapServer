module.exports = function() {
 
 
    var playerMessage = function(player, delay) {
        var playerEquipment = player.getEquippedItems();
        
        return {
          x: player.entity.x, 
          y: player.entity.y, 
          imageId: "" + player.entity.imageId, 
          id: player.entity.id, 
          equipment: playerEquipment,
          speed: player.entity.physics.speed,
          move: player.entity.physics.move,
          delay: delay,
          serverTime: Date.now()
        };
    };
    
    var rigidMessage = function(rigidObject, delay) {
        return {
          x: rigidObject.entity.x, 
          y: rigidObject.entity.y, 
          imageId: "" + rigidObject.entity.imageId, 
          id: rigidObject.entity.id, 
          speed: rigidObject.entity.physics.speed,
          move: rigidObject.entity.physics.move,
          delay: delay,
          serverTime: (new Date()).toUTCString()
        };
    }
    
    var disconnectMessage = function(player) {
        return {
            id: player.entity.id
        };
    };
    
    var heroMessage = function(player) {
        return {
          playerId: player.entity.id
        };
    };
    
    var sectionMessage = function(section){
        return {
            width: section.width, 
            height: section.height,
            dayTime: section.currentTimeOfDay
        };
    };
    
    var tileMessage = function(tile){
           return {
               x: tile.entity.x, 
               y: tile.entity.y, 
               imageId: "" + tile.entity.imageId, 
               id: tile.entity.id
           }
    };
    
    var knockbackMessage = function(player){
        
        return {
            x: player.entity.x, 
            y: player.entity.y,
            id: player.entity.id,
            move: player.entity.physics.move,
            force: player.entity.physics.knockback.force,
            direction: player.entity.physics.knockback.direction
        }
    };
    
     /*
        Sends all players to specific player
     */
    this.sendAllPlayers = function(others, player){
		others.forEach(function(object) {
			player.socket.emit('character', playerMessage(player));
		});
    }
    /*
        Sends player to all players
    */
    this.sendPlayer = function(others, player){
        others.forEach(function(object) {
            if(player.entity.physics.move == 'h'){
                object.socket.emit('character', playerMessage(player, player.entity.physics.hitDelay));
            }
            else{
			    object.socket.emit('character', playerMessage(player));
            }
		});
    }
    
    /*
        Sends rigidObject to all players
    */
    this.sendRigidObject = function(others, rigidObject) {
        others.forEach(function(object) {

			    object.socket.emit('rigidObject', rigidMessage(rigidObject));
            
		});
    }
    
    /*
        Sends HeroID to himself
    */
    
    this.sendHero = function(player){
        player.socket.emit('hero', heroMessage(player));
    }
    /*
        Sends section info to specific player
    */
    this.sendSectionInfo = function(section, player){
        player.socket.emit('sectionInfo', sectionMessage(section));
        console.log(sectionMessage(section));
    }
    
    this.sendDisconnectMessage = function(others, id) {
        others.forEach(function(object) {
           object.socket.emit('disconnectMessage', id); 
            
        });
    }
    //Tiles
    
    /*
        Sends all tiles to specific player
    */
    this.sendAllTiles = function(tiles, player){
		tiles.forEach(function(tile) {
			player.socket.emit('object', tileMessage(tile));
		});
    }
    this.sendAllRigidObjects = function(objects, player){
		objects.forEach(function(object) {
			player.socket.emit('rigidObject', rigidMessage(object));
		});
    }
    /*
        Sends one tile to all players
    */
    this.sendTile = function(players, tile){
        
        players.forEach(function(object){
            object.socket.emit('object', tileMessage(tile));
        });
    }
    
    this.sendKnockback = function(others, player){
        others.forEach(function(object) {
            object.socket.emit('knockback', knockbackMessage(player));
		});
    }
    
}