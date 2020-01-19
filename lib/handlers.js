/*
*Request handlers
*
*/

// Dependancies
var _data = require('./data');
var helpers = require('./helpers.js');

// Define all the handlers
var handlers = {};

handlers.users = function(data,callback){
    var acceptableMethods = ['post','get','put','delete'];
    if(acceptableMethods.indexOf(data.method) > -1){
      handlers._users[data.method](data,callback);
    }else{
      callback(405);
    }
};

//containers for the users submethods
handlers._users = {};

//Users-post
//Required data: firstName, lastName, phone, password, tosAgreement
//Optional data:none
handlers._users.post = function(data,callback){
//Check that all the required data fields are filled out
var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
var tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

if(firstName && lastName && phone && password && tosAgreement){
  //Make sure that the user doesn't already exist
  _data.read('users',phone,function(err,data){
    if(err){
      //Hash the password 
      var hashedPassword = helpers.hash(password);

        // Create the user object
        if(hashedPassword){
          var userObject = {
            'firstName' : firstName,
            'lastName' : lastName,
            'phone' : phone,
            'hashedPassword' : hashedPassword,
            'tosAgreement' : true
          };
  
          // Store the user
          _data.create('users',phone,userObject,function(err){
            if(!err){
              callback(200);
            } else { 
              console.log(err);
              callback(500,{'Error' : 'Could not create the new user'});
            }
          });
        } else {
          callback(500,{'Error' : 'Could not hash the user\'s password.'});
        }

    }else{
      //User already existis
      callback(400, {'Error': 'A user with that phone number already exists'});
    }
  });
} else {
  callback(400,{'Error' : 'Missing required fields'});
}
};

// Required data: phone
// Optional data: none
// @TODO Only let an authenticated user access their object. Dont let them access anyone elses.
handlers._users.get = function(data,callback){
  // Check that phone number is valid
  var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
  if(phone){
    // Lookup the user
    _data.read('users',phone,function(err,data){
      if(!err && data){
        // Remove the hashed password from the user user object before returning it to the requester
        delete data.hashedPassword;
        callback(200,data);
      } else {
        callback(404);
      }
    });
  } else {
    callback(400,{'Error' : 'Missing required field'})
  }
};


//Users-put
//Required data : phone
//Optional data: firstName, lastName, password (atleast one must be specified)
//@TODO onlylet an authenticated user update their own, don't let him update others 
handlers._users.put = function(data,callback){
  var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
 
  //check for the optional fields
  var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
 
  //Error if the phone is invalid
  if (phone){
    //Error if nothing is sent to update
    if (firstName || lastName ||password){
      //lookup user
      _data.read('users',phone,function(err,userData){
        if(!err && userData){
            //update the fields necessary
            if(firstName){
              userData.firstName = firstName;
            }
            if(lastName){
              userData.lastName = lastName;
            }
            if(password){
              userData.hashedPassword = helpers.hash(password);
            }
              //Store the new updates
              _data.update('users',phone,userData,function(err){
                if(!err){
                    callback(200);
                }else{
                  console.log(err);
                  callback(500,{'Error' : 'Could not update the user'});
                }
              });
        } else{
          callback(400,{'Error' : 'The specified user does not exist'});
        }
      });

    }else {
      Callback(400,{'Error' : 'Missing fields to update'});
    }

  } else{
    callback(400, {'Err':'Missing required field'});
  }

};

//Users-delete
//Required field:phone
//@TODO only let the authenticated user delete their object, don't let them delete anyone else's
//@TODO clean up (delete) any other data files associated with this user
handlers._users.delete = function(data,callback){
  // Check that phone number is valid
  var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
  if(phone){
    // Lookup the user
    _data.read('users',phone,function(err,data){
      if(!err && data){
         _data.delete('users', phone, function(err){
           if(!err){
             callback (200);
           } else{
             callback(500, {'Error':'Could not find the specified user'})
           }
         })
        
      } else {
        callback(400,{'Err':'could not find the specified user'});
      }
    });
  } else {
    callback(400,{'Error' : 'Missing required field'})
  }
};
  

// Ping handler
handlers.ping = function(data,callback){
    callback(200);
};

// Not-Found handler
handlers.notFound = function(data,callback){
  callback(404);
};

//Export the module
module.exports = handlers