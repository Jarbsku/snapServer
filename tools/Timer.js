module.exports = function(){
    //variables for fixed timestep
    var timeAtLastFrame = new Date().getTime();
    var idealTimePerFrame = 1000 / 30;
    var leftover = 0.0;
    var frames = 0;
    
    //variables for timing events in general
    var time;
    var elapsedTime;
    var running = false;
    
    this.start = function(){
        time = new Date().getTime();
        running = true;
    }
    
    this.pause = function(){
        running = false;
    }
    
    this.restart = function(){
        this.start();
    }
    
    var getElapsed = function(){
        return new Date().getTime() - time;
    }
    
    //counts minutes
    this.isPassedMinutes = function(minutes){
        return ((getElapsed() / (1000 * 60)) %60) > minutes;
    }
    
    this.isPassedMillis = function(millis){
        return getElapsed() > millis;
    }
    
    this.tick = function(callback) {
        var timeAtThisFrame = new Date().getTime();
        var timeSinceLastDoLogic = (timeAtThisFrame - timeAtLastFrame) + leftover;
        var catchUpFrameCount = Math.floor(timeSinceLastDoLogic / idealTimePerFrame);
        
        for(var i = 0 ; i < catchUpFrameCount; i++){
            callback;
        }
        
        leftover = timeSinceLastDoLogic - (catchUpFrameCount * idealTimePerFrame);
        timeAtLastFrame = timeAtThisFrame;
    } 
    
}