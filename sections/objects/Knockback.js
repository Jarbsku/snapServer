
/*
takes params entity, force and direction. 
does calculations in update for how much and to what direction
current entity should be moved
*/

module.exports = function(entity, force, direction) {

    this.entity = entity;
    this.force = force;
    this.direction = direction;
    
    var resistance = 1;
    
    this.done = false;
    
    //add this to knockbacking objects. indexOf makes sure its unique in that array.
    if(global.knockBackingObjects.indexOf(this.entity) < 0) global.knockBackingObjects.push(this.entity);
    
    //set entitys move to 'k' = knockback
    
    /*
    when knockback is attached to objects physics 
    it will override objects normal update
    */
    
    this.update = function() {
        this.entity.move = 'k';
        console.log("<knockback.js> force: "+ this.force+" direction: "+this.direction+" entity x:"+this.entity.x+" entity y:"+this.entity.y+" id:"+this.entity.id);
        switch (this.direction) {
            
            case 'u':
                this.entity.deltaY -= this.force;
                break;
            case 'd':
                this.entity.deltaY += this.force;
                break;
            case 'l':
                this.entity.deltaX -= this.force;
                break;
            case 'r':
                this.entity.deltaX += this.force;
                break;
                
        }

        if(this.force > 0) {
            this.force -= resistance;
        } else {
            this.entity.sendMe = true;
            this.done = true;
        }

    }

    this.isDone = function() {
        return this.done;
    }

}