module.exports = Timer;


function Timer () {
  if(!(this instanceof Timer)) return new Timer();

  var startTimes = {
  };
  var stopTimes = {
  };
  this.start = function start(key) {
    startTimes[key] = Date.now();
  }

  this.stop = function stop(key) {
    if(!startTimes.hasOwnProperty(key)) {
      return 0;
    }
    if(stopTimes.hasOwnProperty(key)) {
      return stopTimes[key];
    }
    stopTimes[key] = Date.now() - startTimes[key];
    return stopTimes[key];
  };

  this.toJSON = function toJSON() {
    var result = {};
    for (var key in startTimes) {
      result[key] = this.stop(key);
    }
    return result;
  };

}

