const express = require('express');
const router = express();
const User = require('../../models/User');
const registration = require('../../validation/registration');
const Validator = require('validator');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');
const mail = require('../../utils/mailer');
const validateLoginInput = require('../../validation/login');
const keys = require('../../config/keys');
const bcrypt=require('bcryptjs')

router.post('/register', (req, res) => {
    const {errors, isValid} = registration(req.body)

    if (!isValid) {
        return res.status(400).json(errors);
    }

    User.findOne({$and: [{username: req.body.username, email: req.body.email}]}).then(data => {
        if (data) {
            if (Validator.equals(data.username, req.body.username)) {
                errors.username = "Username already exist";
                res.status(400).json(errors);
            } else if (Validator.equals(data.email, req.body.email)) {
                errors.email = "Email already exist"
            }
        } else {
            const userFields = {};

            const code = otpGenerator.generate(6, {
                digits: true,
                alphabets: false,
                upperCase: false,
                specialChars: false
            })
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(req.body.password, salt, (err, hash) => {
                    if (err) throw err;

                    userFields.password = hash;
                    userFields.code = code;
                    userFields.username = req.body.username;
                    userFields.email = req.body.email


                    new User(userFields).save().then((data) => {

                        if (process.env.NODE_ENV === 'production') {
                            const route = "api/users/verifyAccount/"
                            const url = process.env.URL + route + data.code;
                            mail(data.email, "User Verification", `Please click on following link to validate your account:<a href="${url}">${url}</a>`, `Please click on following link to validate your account:<a href="${url}">${url}</a>`);

                        } else {
                            const url = `http://localhost:5000/api/users/verifyAccount/${data.code}`;
                            mail(data.email, "User Verification", `Please click on following link to validate your account:<a href="${url}">${url}</a>`, `Please click on following link to validate your account:<a href="${url}">${url}</a>`);
                        }
                    }).catch(err => {
                        console.log(err.message)
                        res.json("Something went wrong")
                    })
                    res.json("User successfully registered")
                })
            })

        }
    }).catch(e => {
        console.log(e.message)
        res.json("Server Error");
    })
})

router.get('/verifyAccount/:token', (req, res) => {
    try {
        console.log(req.params.token);

        if (!req.params.token) {
            res.json({"errors": "Token not found"})
        }

        User.findOneAndUpdate({code: req.params.token}, {verify: 1}).then(data => {
            if (!data) {
                return res.status(400).json({errors: [{msg: "Error not verified"}]});
            }
            const code = otpGenerator.generate(6, {
                digits: true,
                alphabets: false,
                upperCase: false,
                specialChars: false
            })
            User.findOneAndUpdate({code: req.params.token}, {code: code}).then(user => {
                res.json("You are verified");
            }).catch(e => {
                console.log(e.message)
                res.json("Something went wrong")
            })
        })
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


router.post('/login', (req, res) => {
    const {errors, isValid} = validateLoginInput(req.body)

    if (!isValid) {
        res.json(errors);
    }

    User.findOne({email: req.body.email}).then(data => {
        if (!data) {
            errors.user = "User does not exist"
            res.json(errors);
        }
        if (data.verify === 0) {
            errors.username = "Account not verified";
            return res.status(404).json(errors);
        }
        bcrypt.compare(req.body.password, data.password).then(isMatch => {
            if (!isMatch) {
                errors.password = "Password incorrect";
                return res.status(400).json(errors)
            } else {

                const payload = {
                    id: data.id,
                };

                jwt.sign(payload, keys.secretOrKey, {expiresIn: 3600}, (err, token) => {
                    res.json({success: true, token: 'Bearer ' + token})
                });
            }
        })
    }).catch(err => {
        console.log(err.message)
        res.json("Server Error")
    })
})

module.exports = router
