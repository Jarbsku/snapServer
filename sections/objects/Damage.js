
module.exports = function(damage,position, direction, ttl,size, delay, sourceId){
	
	this.x = position.x;
	this.y = position.y;
	this.size = size;
	this.damage = damage;
	this.direction = direction;
	this.ttl = ttl;
	this.sourceId = sourceId;

}