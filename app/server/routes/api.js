var jwt       = require('jsonwebtoken');
var validator = require('validator');
var express = require('express');

var User = require('../models/User');
var UserController = require('../controllers/UserController');

require('dotenv').config({path: '../../../.env'});

module.exports = function(router) {
    router.use(express.json());

    // Admin update user stuff
    /*
    router.post('/update', function (req, res) {
        var password = req.body.user;
        var token = req.body.token;

        // user [username, +kills, +deaths, +matches, +action]

        if (token) {
            UserController.loginWithToken(token, function (err, token, user) {
                if (err || !user) {
                    return res.json({error: "Error: Invalid Token"});
                }
                return res.json({
                    token: token,
                    user: user
                });
            })
        }
    }); */
    
    router.post('/updateZhekko', function (req, res) {
        var token = req.body.token;
        var username = req.body.username;
        var sender = req.body.sender;
        var amount = req.body.amount;

        if (!token || !username || !sender || !amount || amount <= 0) {
            return res.json({'error': 'Invalid parameters'});
        }

        jwt.verify(token, JWT_SECRET, function (err, payload) {
            if (err || !payload) {
                console.log('ur bad');
                return res.json({'error': err});
            }

            if (payload.type != 'zhekko' || !payload.exp || Date.now() >= payload.exp * 1000) {
                return res.json({
                    error: 'Error: Invalid token'
                });
            }

            // Past this point = good

            User.findOneAndUpdate(
                {
                    "username": username
                }, {
                    $push: {
                        'actions': {
                            "caption": sender + " sent you " + amount + " Zhekkos!",
                            "date":Date.now(),
                            "type":"INFO"
                        }
                    },
                    $inc: {
                        'money' : amount
                    }
                }, {
                    new: true
                }, function (err, user) {
                    if (err || !user) {
                        return res.json({error: "Error: User not found"});
                    }

                    return res.json({message: "Success"});
                }
            );

        }.bind(this));

        // [username, +zhekko]
    });

    router.get('/data/:username', function (req, res) {
        var username = req.params.username;

        if (!username) {
            return res.json({error: "Error: Invalid username"});
        }

        User.findOneByUsername(username).exec(function (err, user) {

            console.log(user);

            if (user) {
                user = user.toJSON();
                delete user.email;
                delete user.id;
                delete user.money;
                delete user._id;
                delete user.__v;


                return res.json(user);
            } else {
                return res.json({error: "Error: Invalid username"});
            }

        });

    });

    router.get('/refresh/:token', function (req, res) {

        var token = req.params.token;

        console.log(token);

        if (!token) {
            return res.json({error: "Error: Invalid Token"});
        }

        User.getByToken(token, function (err, user) {
            return res.json({user: user});
        });
    });

    router.get('/', function (req, res) {
        res.end("lol, what are you doing here?");
    })
};