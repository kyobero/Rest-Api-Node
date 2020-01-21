/*
*Request handlers
*
*/

// Dependancies
var _data = require('./data');
var helpers = require('./helpers.js');


// Define all the handlers
var handlers = {};

handlers.eit = function(data,callback){
    var acceptableMethods = ['post','get','put','delete'];
    if(acceptableMethods.indexOf(data.method) > -1){
      handlers._eit[data.method](data,callback);
    }else{
      callback(405);
    }
};

//containers for the users submethods
handlers._eit = {};

//Users-post
//Required data: firstName, lastName, phone, password, tosAgreement
//Optional data:none
handlers._eit.post = function(data,callback){
//Check that all the required data fields are filled out
var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
var email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;
var country = typeof(data.payload.country) == 'string' && data.payload.country.trim().length > 0 ? data.payload.country.trim() : false;
var age = typeof(data.payload.age) == 'string' && data.payload.age.trim().length > 0 ? data.payload.age.trim() : false;
//var tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

if(firstName && lastName && email && country && age){
  //Make sure that the user doesn't already exist
  _data.read('users',email,function(err,data){
    if(err){
      // //Hash the password 
      // var hashedPassword = helpers.hash(password);

        // // Create the user object
        // if(hashedPassword){
          var  userObject = {
            'firstName' : firstName,
            'lastName' : lastName,
            'email' : email,
            'country' : country,
            'age' : age
            //'tosAgreement' : true
          };
  
          // Store the user
          _data.create('users',email,userObject,function(err){
            if(!err){
              callback(200);
            } else { 
              console.log(err);
              callback(500,{'Error' : 'Could not create the new user'});
            }
          });
        // } else {
        //   callback(500,{'Error' : 'Could not hash the user\'s password.'});
        // }

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
handlers._eit.get = function(data,callback){
  // Check that phone number is valid
  var email = typeof(data.queryStringObject.email) == 'string' && data.queryStringObject.email.trim().length > 0 ? data.queryStringObject.email.trim() : false;
  if(email){
    // Lookup the user
    _data.read('users',email,function(err,data){
      if(!err && data){
        // // Remove the hashed password from the user user object before returning it to the requester
        // delete data.hashedPassword;
        callback(200,data);
      } else {
        callback(404);
      }
    });
  } else {
      _data.list("users", function(err,data){
        if (!err && data) {
          callback (200,data)
        } else{
          callback(400,{'Error' : 'can not desplay the available users'});
        }
      })
  }
};


//Users-put
//Required data : phone
//Optional data: firstName, lastName, password (atleast one must be specified)
//@TODO onlylet an authenticated user update their own, don't let him update others 
handlers._eit.put = function(data,callback){
  var email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;
  //var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
 
  //check for the optional fields
  var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  //var email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;
  var country = typeof(data.payload.country) == 'string' && data.payload.country.trim().length > 0 ? data.payload.country.trim() : false;
  var age = typeof(data.payload.age) == 'string' && data.payload.age.trim().length > 0 ? data.payload.age.trim() : false;
 
  //Error if the phone is invalid
  if (email){
    //Error if nothing is sent to update
    if (firstName || lastName || country || age){
      //lookup user
      _data.read('users',email,function(err,userData){
        if(!err && userData){
            //update the fields necessary
            if(firstName){
              userData.firstName = firstName;
            }
            if(lastName){
              userData.lastName = lastName;
            }
            if(country){
              userData.country = country;
            }
            if(age){
              userData.country = age;
            }
              //Store the new updates
              _data.update('users',email,userData,function(err){
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
handlers._eit.delete = function(data,callback){
  // Check that phone number is valid
  var email = typeof(data.queryStringObject.email) == 'string' && data.queryStringObject.email.trim().length > 0 ? data.queryStringObject.email.trim() : false;
  if(email){
    // Lookup the user
    _data.read('users',email,function(err,data){
      if(!err && data){
         _data.delete('users', email, function(err){
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