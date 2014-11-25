module.exports = Timer;


function Timer () {
  if(!(this instanceof Timer)) return new Timer();

  var startTimes = {
  };
  this.start = function start(key) {
    startTimes[key] = Date.now();
  }

  this.stop = function stop(key) {
    if(startTimes.hasOwnProperty(key)) {
      return Date.now() - startTimes[key];
    }
    return 0;
  };

}

