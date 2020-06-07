const Validator = require('validator');
const isEmpty = require('../is-empty');

module.exports = function validateRegisterInput(data) {
    let errors = {};
    data.username = !isEmpty(data.username) ? data.username : '';
    data.email = !isEmpty(data.email) ? data.email : '';
    data.password = !isEmpty(data.password) ? data.password : '';
    if (!Validator.isLength(data.username, {min: 5, max: 30})) {
        console.log(data.username);
        errors.username = "Username must be between 5 to 30 characters";
    }

    if (Validator.isEmpty(data.username)) {
        errors.username = "Username is required";
    }

    if (Validator.isEmpty(data.email)) {
        errors.email = "Email is required";
    }

    if (!Validator.isEmail(data.email)) {
        errors.email = "Email is not valid";
    }

    if (Validator.isEmpty(data.password)) {
        errors.password = "Password is required";
    }

    if (!Validator.isLength(data.password, {min: 6, max: 30})) {
        errors.password = "Password must be between 5 to 30 characters";
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
};
