//custom modules
var Section = require('./sections/Section.js');
var Player = require('./sections/objects/Player.js');
var DayCycle = require('./tools/DayCycle.js');
var Timer = require('./tools/Timer.js');

/* WorldModule has all the sections 
	- Initializes sections
	- handles when sections are updated
	- gets objects from sections objectqueue passes them for socket.emit
*/

//socket connection functions
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var async = require('async');

var timer = new Timer();

var  WorldModule = function(){

	this.sectionList = [];
	this.currentTimeOfDay = 'm'; //when server starts its morning
	var allPlayers = [];
	var dayCycle = new DayCycle();
	this.currentTimeOfDay = dayCycle.getCycle();
	console.log(this.currentTimeOfDay);
	this.asyncUpdateSections = [];
	
	this.swappers = []; // players who wants to change section
	
// Create all the sections and put them in sectionList
	for(var y = 0; y < 2; y++){
		this.sectionList[y] = [];
		for(var x = 0; x < 2; x++){
			var id = 'section'+y+''+x;
			console.log(this.swapSection);
			this.sectionList[y][x] = new Section(id, io, this.currentTimeOfDay , this.swappers);
		}
	}
	
	
	
	
	// Updates day cycle and all the sections logic
	this.update = function(){
		
		if(this.swappers.length > 0){
			var swapper = this.swappers.pop();
			this.sectionList[0][0].removePlayer(swapper);
			swapper.currentSection = [0,1];
			this.sectionList[0][1].pushPlayer(swapper);
		}
		
		//checks if time of the day has changed. if changed, informs all clients about it.
		if(dayCycle.getCycle() != this.currentTimeOfDay){
		
			this.currentTimeOfDay = dayCycle.getCycle();
			switch(this.currentTimeOfDay){
				case 'm':
					console.log("its morning");
					break;
				case 'd':
					console.log("its day");
					break;
				case 'e':
					console.log("its evening");
					break;
				case 'n':
					console.log("its night");
					break;
			}
			io.sockets.emit('dayCycle', 'd'/*this.currentTimeOfDay*/);
		}
		
		for(var y = 0; y < 2; y++){
			for(var x = 0; x < 2; x++){
				this.sectionList[y][x].update(this.currentTimeOfDay);
			}
		}
	}

	// Log debugstrings from all sections
	this.monitorSections = function() {
		console.log('*****************');
		for(var y = 0; y < 2; y++){
			for(var x = 0; x < 2; x++){
				this.sectionList[y][x].monitor();
			}
		}
		console.log('*****************');
	}

	
	
}

// Create a new (only) instance of world
var world = new WorldModule();
// Run all the sections updates periodically


setInterval(function(){timer.tick(world.update())}, 1000/30);

//setInterval(function(){world.update()}, 30);


// DEGUG! Comment this out whenever possible. It can be costly
//setInterval(function(){world.monitorSections()}, 200);


/*app.get('/', function(req, res){
	res.sendFile(__dirname + '/html/index.html');
});*/
app.use(express.static(__dirname + '/public'));

// Socket specefic connection logic
io.on('connection', function(socket){
	
	var player = new Player(32,32,socket);

	world.sectionList[0][0].pushPlayer(player);
	
	socket.on('move', function(move){
		player.entity.physics.setMove(move.move);
	});

	socket.on('disconnect', function() {
		world.sectionList[player.currentSection[0]][player.currentSection[1]].removePlayer(player);
		console.log("player " + player.entity.id + " disconnected");
	});
 
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
