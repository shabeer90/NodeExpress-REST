/**
 * Created by ShabeerSheffa on 03/08/2015.
 */

var express = require('express');
var app = express();
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

var config = require('../config'); // get our config file
// Secret variable
app.set('superSecret', config.secret);

var apiRoutes = express.Router();

// route to show a random message (GET http://localhost:8080/api/authenticate)
apiRoutes.post('/authenticate', function (req, res) {
    var db = req.db;
    var collection = db.get('superusers');
    collection.findOne({
        'email': req.body.email
    }, function (err, user) {
        if (err) throw err;

        if (!user) {
            res.json({success: false, message: 'Authentication failed. User not found.'})
        } else if (user) {
            if (user.password != req.body.password) {
                res.json({success: false, message: 'Authentication failed. Incorrect Details.'})
            } else {
                // if user is found and password is right
                // create a token
                var token = jwt.sign(user, app.get('superSecret'), {
                    expiresInMinutes: 1440 // expires in 24 hours
                });

                res.json({
                    success: true,
                    message: 'Enjoy your token',
                    token: token
                });
            }
        }
    });
});

// route middleware to verify a token
apiRoutes.use(function (req, res, next) {
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    console.log(token)
    // decode token
    if (token) {
        jwt.verify(token, app.get('superSecret'), function (err, decoded) {
            if (err) {
                return res.json({success: false, message: 'Failed to authenticate token.'});
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });
    } else {
        // if there is no token
        // return an error
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }
});

// route to show a random message (GET http://localhost:8080/api/)
apiRoutes.get('/', function (req, res) {
    res.json({message: 'Welcome to the coolest API on earth'});
});

// route to return all users (GET http://localhost:8080/api/users)
apiRoutes.get('/users', function (req, res) {
    var db = req.db;
    var collection = db.get('superusers');
    collection.find({}, {}, function (e, docs) {
        res.json(docs);
    });
});


module.exports = apiRoutes;
