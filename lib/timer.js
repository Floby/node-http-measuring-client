module.exports = Timer;


function Timer () {
  if(!(this instanceof Timer)) return new Timer();

  var startTimes = {
  };
  var stopTimes = {
  };

  function deltaFor (key) {
    return stopTimes[key] - startTimes[key];
  }

  this.start = function start(key) {
    startTimes[key] = Date.now();
  }

  this.stop = function stop(key) {
    if(!startTimes.hasOwnProperty(key)) {
      return 0;
    }
    if(stopTimes.hasOwnProperty(key)) {
      return deltaFor(key);
    }
    stopTimes[key] = Date.now()
    return deltaFor(key);
  };

  this.toJSON = function toJSON() {
    var result = {};
    for (var key in startTimes) {
      result[key] = this.stop(key);
    }
    return result;
  };

}

