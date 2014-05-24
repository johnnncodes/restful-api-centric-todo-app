var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var moment = require('moment');

var Account = require('../../models/account.js');
var Todo = require('../../models/todo.js');

var secretToken = 'mysupersecrettoken';

function generateNewToken(req, res, next) {
  delete req.user.iat;
  delete req.user.exp;
  req.newToken = jwt.sign(req.user, secretToken, { expiresInMinutes: 60 });
  return next();
}

function formatValidationErrors(err) {
  console.log('Error to be formatted: ');
  console.log(err);

  var errors = [];

  // set defaults
  if (! err.message) {
    err.message = 'Validation failed';
  }

  if (err.code === 11000) {
    var error = {};
    error.field = 'Email';
    error.message = 'Email is already used';
    errors.push(error)
  } else {
    Object.keys(err.errors).forEach(function (field) {
      var error = {};
      error.field = err.errors[field].path
      error.message = err.errors[field].message
      errors.push(error);
    });
  }

  err.errors = errors;
  return err;
}

// REST api routes
module.exports = function(app) {

  // endpoint to refresh token
  app.get('/api/v1/tokens/refresh', expressJwt({secret: secretToken}), generateNewToken, function(req, res) {
    var response = {};
    response.token = req.newToken;
    return res.json(response);
  });

  app.post('/api/v1/accounts', function(req, res) {
    var account = new Account();
    account.email = req.param('email');
    account.password = req.param('password');
    account.passwordConfirmation = req.param('passwordConfirmation');
    account.save(function(err, account){
      if (err) {
        console.log(err);

        switch(err.name) {
          case 'ValidationError':
            err = formatValidationErrors(err);
            console.log(err);
            return res.json(422, err);
            break;
          case 'MongoError':
            if (err.code === 11000) {
              err = formatValidationErrors(err);
              console.log(err);
              return res.json(422, err);
              break;
            }
          default:
            return res.send(500, {});
        }
      }

      return res.json(201, {});
    });
  });

  app.post('/api/v1/sessions', function(req, res) {
    Account.findOne({email: req.param('email')}, function(err, account) {
      if (err) {
        console.log(err);
        return res.json(500, {});
      }

      if (! account) {
        console.log('Account not found');
        return res.json(401, {});
      }

      account.comparePassword(req.param('password'), function(err, isMatch) {
        if (err) {
          console.log(err);
          console.log("Attempt failed to login with " + account.email);
          return res.json(401, {});
        }

        // remove password in the account instance, before generating a token
        account = account.toJSON();
        delete account.password;
        console.log(account);

        var token = jwt.sign(account, secretToken, { expiresInMinutes: 60 });
        return res.json({token:token});
      });
    });
  });

  app.get('/api/v1/todos/:id?', expressJwt({secret: secretToken}), generateNewToken, function(req, res) {
    var response = {};
    response.token = req.newToken;

    if (req.params.id) {
      Todo.findOne({ _id: req.params.id, user: req.user._id }).exec(function(err, todo) {
        if (err) {
          console.log(err);
          return res.json(500, response);
        }

        response.todo = todo;
        return res.json(200, response);
      });
    } else {
      Todo.find({ user: req.user._id }).exec(function(err, todos) {
        if (err) {
          console.log(err);
          return res.json(500, response);
        }

        response.todos = todos;
        return res.json(200, response);
      });
    }
  });

  app.post('/api/v1/todos', expressJwt({secret: secretToken}), generateNewToken, function(req, res) {
    var response = {};
    response.token = req.newToken;

    var todo = new Todo();
    todo.name = req.param('name');
    todo.user = req.user._id;
    todo.save(function(err, todo) {
      if (err) {
        console.log(err);

        switch(err.name) {
          case 'ValidationError':
            err = formatValidationErrors(err);
            console.log(err);
            return res.json(422, err);
            break;
          case 'MongoError':
            if (err.code === 11000) {
              return res.json(422, response);
              break;
            }
          default:
            return res.send(500, response);
        }
      }

      return res.json(201, response);
    });
  });

  app.delete('/api/v1/todos/:id', expressJwt({secret: secretToken}), generateNewToken, function(req, res) {
    Todo.findOne({_id: req.param('id'), user: req.user._id}).exec(function(err, todo) {
      var response = {};
      response.token = req.newToken;

      if (err) {
        console.log(err);
        return res.json(500, response);
      }

      if (todo != null) {
        todo.remove();
        return res.json(200, response);
      } else {
        return res.json(400, response);
      }
    });
  });

  app.put('/api/v1/todos/:id', expressJwt({secret: secretToken}), generateNewToken, function(req, res) {
    var response = {};
    response.token = req.newToken;

    Todo.findOne({_id: req.param('id'), user: req.user._id}).exec(function(err, todo) {
      if (err) {
        console.log(err);
        return res.json(500, response);
      }

      if (todo != null) {
        todo.name = req.param('name');
        todo.save(function(err, todo){
          if (err) {
            return res.json(500, response);
          }
          return res.json(200, response);
        });
        return res.json(200, response);
      } else {
        return res.json(400, response);
      }
    });
  });

};