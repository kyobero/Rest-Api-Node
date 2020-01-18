/*
*Helpers for the various tasks
*
*/

// Dependencies
var config = require('./config');
var crypto = require('crypto');

//Container for all the Helpers

var helpers = {};

// Create a SHA256 hash
helpers.hash = function(str){
    if(typeof(str) == 'string' && str.length > 0){
      var hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
      return hash;
    } else { 
      return false;
    }
  };

// parse a Json string to an object in all cases, without throwing
helpers.parseJsonToObject = function (str){
    try{
        var obj = JSON.parse(str);
        return obj;
    }catch(e){
        return {};
    }
    };


   
   
//Export the module
module.exports = helpers;
