/*
 * Primary file for API
 *
 */

// Dependencies
var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require('fs');
var _data = require('./lib/data');


//Testing
//@TODO
_data.read('test','newfile', function(err,data){
  console.log('This was the error', err, 'and ths was the data', data);
  });

 // Instantiate the HTTP server
var httpServer = http.createServer(function(req,res){
  unifiedServer(req,res);
});

// Start the HTTP server
httpServer.listen(config.httpPort,function(){
  console.log('The HTTP server is running on port '+config.httpPort);
});

// Instantiate the HTTPS server
var httpsServerOptions = {
  'key': fs.readFileSync('./https/key.pem'),
  'cert': fs.readFileSync('./https/cert.pem')
};
var httpsServer = https.createServer(httpsServerOptions,function(req,res){
  unifiedServer(req,res);
});

// Start the HTTPS server
httpsServer.listen(config.httpsPort,function(){
 console.log('The HTTPS server is running on port '+config.httpsPort);
});

// All the server logic for both the http and https server
var unifiedServer = function(req,res){

  // Parse the url
  var parsedUrl = url.parse(req.url, true);

  // Get the path
  var path = parsedUrl.pathname;
  var trimmedPath = path.replace(/^\/+|\/+$/g, '');

  // Get the query string as an object
  var queryStringObject = parsedUrl.query;

  // Get the HTTP method
  var method = req.method.toLowerCase();

  //Get the headers as an object
  var headers = req.headers;

  // Get the payload,if any
  var decoder = new StringDecoder('utf-8');
  var buffer = '';
  req.on('data', function(data) {
      buffer += decoder.write(data);
  });
  req.on('end', function() {
      buffer += decoder.end();

      // Check the router for a matching path for a handler. If one is not found, use the notFound handler instead.
      var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

      // Construct the data object to send to the handler
      var data = {
        'trimmedPath' : trimmedPath,
        'queryStringObject' : queryStringObject,
        'method' : method,
        'headers' : headers,
        'payload' : buffer
      };

      // Route the request to the handler specified in the router
      chosenHandler(data,function(statusCode,payload){

        // Use the status code returned from the handler, or set the default status code to 200
        statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

        // Use the payload returned from the handler, or set the default payload to an empty object
        payload = typeof(payload) == 'object'? payload : {};

        // Convert the payload to a string
        var payloadString = JSON.stringify(payload);

        // Return the response
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(statusCode);
        res.end(payloadString);
        console.log(trimmedPath,statusCode);
      });

  });
};

// Define all the handlers
var handlers = {};

// Ping handler
handlers.ping = function(data,callback){
    callback(200);
};

// Not-Found handler
handlers.notFound = function(data,callback){
  callback(404);
};

// Define the request router
var router = {
  'ping' : handlers.ping
};



// const fs = require('fs');
// const url = require('url');
// const http = require('http');
// const https = require('https');
// const { StringDecoder } = require('string_decoder');

// const requestHandler = (req, res) => {
//   // Get the URL and parse it
//   const parsedUrl = url.parse(req.url, true);

//   // Get the path
//   const path = parsedUrl.pathname;
//   const trimmedPath = path.replace(/^\/+|\/+$/g, '');

//   // Get the query string as an object
//   const queryStringObject = parsedUrl.query;

//   // Get the HTTP method
//   const method = req.method.toLowerCase();

//   // Get the headers as an object
//   const headers = req.headers;

//   // Required to decode the streams of data
//   // from the HTTP request into string
//   const decoder = new StringDecoder('utf-8');
//   let buffer = '';

//   // A "data" event is emmited each time a stream is received
//   req.on('data', data => {
//     buffer += decoder.write(data)
//   });

//   // After all streams have been received, an "end" event is emmited
//   req.on('end', () => {
//     buffer += decoder.end()
//     const handler = typeof(router[trimmedPath]) == 'undefined' ? handlers.notFound : router[trimmedPath];

//     const data = {
//       path,
//       method,
//       headers,
//       trimmedPath,
//       queryStringObject,
//       payload: buffer,
//     };

//     handler(data, (statusCode, payload) => {
//       statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
//       payload = JSON.stringify(typeof(payload) == 'object' ? payload : {});

//       res.writeHead(statusCode, {
//         'Content-Type': 'application/json'
//       });

//       // We could also set the header by using setHeader
//       // res.setHeader('Content-Type', 'application/json');

//       res.end(payload);

//       console.log('Returning response: ', statusCode, payload);
//     });

//   });
// }

// const httpServer = http.createServer(requestHandler);

// const httpsOptions = {
//   key: fs.readFileSync('./https/key.pem'),
//   cert: fs.readFileSync('./https/cert.pem')
// };

// const httpsServer = https.createServer(httpsOptions, requestHandler);

// httpServer.listen(3000, () => {
//   console.log('HTTP server listening on port 3000!');
// });

// httpsServer.listen(3001, () => {
//   console.log('HTTPS server listening on port 3001!');
// });

// const handlers = {
//   sample(data, callback) {
//     callback(200, {name: 'sample handler'})
//   },

//   notFound(data, callback) {
//     callback(404)
//   }
// }

// const router = {
//   sample: handlers.sample
// };
