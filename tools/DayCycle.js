var Timer = require('./Timer.js');

module.exports = function(){
    
    var timer = new Timer();
    timer.start();
    
    this.cycle = ['m','d','e','n']; //morning, day, evening, night;
    var cycleIndex = 0;
    
    
    this.getCycle = function(){
        
        if(timer.isPassedMinutes(0.2)){
            if(cycleIndex >= 3){
                cycleIndex = 0;
            }else{
                cycleIndex++;
            }
            timer.restart();
        }
        return this.getCurrentDayTime();
    }
    
    this.getCurrentDayTime = function(){
        return this.cycle[cycleIndex];
    }
    
}