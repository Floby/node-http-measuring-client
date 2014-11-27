module.exports = Timer;


function Timer () {
  if(!(this instanceof Timer)) return new Timer();

  var startTimes = {};
  var stopTimes = {};

  function deltaFor (key) {
    return stopTimes[key] - startTimes[key];
  }
  function started (key) {
    return startTimes.hasOwnProperty(key);
  }
  function stopped (key) {
    return stopTimes.hasOwnProperty(key);
  }

  this.start = function start(key) {
    return startTimes[key] = Date.now();
  }

  this.stop = function stop(key) {
    if (!started(key)) return 0;
    if (stopped(key)) return deltaFor(key);
    stopTimes[key] = Date.now()
    return deltaFor(key);
  };

  this.peek = function (key) {
    if (stopped(key)) return deltaFor(key);
    var start = startTimes[key] || 0;
    return Date.now() - start;
  };

  this.toJSON = function toJSON() {
    var result = {};
    for (var key in startTimes) {
      result[key] = this.peek(key);
    }
    return result;
  };

}

