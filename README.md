[![Build Status][travis-image]][travis-url] [![Coverage][coveralls-image]][coveralls-url]

node-http-measuring-client
==================

> like the http module, except with stats

This module generates objects usable as a drop-in replacement for
the built-in http module. It emits stats about outbound requests

Installation
------------

    npm install --save http-measuring-client

Usage
-----

```javascript
var http = require('http-measuring-client').create();
http.get('http://google.com', function (response) {
  // `response` is your plain old response object
});

http.on('stat', function (parsedUri, stats) {
  // `parseUri` is parsed with url.parse();
  stats.totalTime; // -> total time taken for request
})
```

Since almost nobody uses `http` directly, this is how you can use it
in combination with  [`request`](https://www.npmjs.org/package/request).

```javascript
var http = require('http-measuring-client').create();
var request = require('request').defaults({
 httpModules: { 'http:': http }
});

request('http://google.com', function (err, response) {
  // everything else is the same
});
```

You can also use it as a replacement for the `https` module
```javascript
var https = require('http-measuring-client').createSecure();
```

In fact, you can use whatever implementation of a `http` or `https` module like so
```javascript
var http = require('http-measuring-client').create(MyOwnHttpModule);
```

Comprehensive Documentation
---------------------------

* `.create([httpModule])`  returns a `http` object usable as a drop-in replacement for
the built-in module. If called with an argument, then it will use that instead of the
default `http` module

* `.createSecure()` calls the previous function with the default `https` module.

* `Event "stat"`: emitted on the http object everytime a request is completed. It is
emitted with two arguments : `uri` and `stats`. The `stats` object looks
like this (all times are milliseconds) :

  * `totalTime` : total time taken for the request
  * `connectionTime` : time taken until the 'socket' event on the request
  * `processingTime` : time taken until the 'response' event on the response
  * `transmittingTime` : time taken from the 'response' event until its 'end' event


TODO
----

* interconnection with logging frameworks like bunyan or winston

Test
----

You can run the tests with `npm test`. You will need to know [mocha][mocha-url]

Contributing
------------

Anyone is welcome to submit issues and pull requests


License
-------

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2014 Florent Jaby

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


[travis-image]: http://img.shields.io/travis/Floby/node-http-measuring-client/master.svg?style=flat
[travis-url]: https://travis-ci.org/Floby/node-http-measuring-client
[coveralls-image]: http://img.shields.io/coveralls/Floby/node-http-measuring-client/master.svg?style=flat
[coveralls-url]: https://coveralls.io/r/Floby/node-http-measuring-client
[mocha-url]: https://github.com/visionmedia/mocha


