const Validator = require('validator');
const isEmpty = require('is-empty');
module.exports = function validateUserReg(data) {
    let errors = {};

    // Convert res into strings
    data.name = !isEmpty(data.name) ? data.name : "";
    data.email = !isEmpty(data.email) ? data.email : "";
    data.password = !isEmpty(data.password) ? data.password : "";

    // Validation
    if (Validator.isEmpty(data.name)) {
        errors.name = "Name is required";
    }
    if (Validator.isEmpty(data.email)) {
        errors.email = "E-mail is required";
    } else if (!Validator.isEmail(data.email)) {
        errors.email = "E-mail is invalid,please check again";
    }

    if (Validator.isEmpty(data.password)) {
        errors.password = "Password is required";
    }
    

    return {
        errors,
        isValid: isEmpty(errors)
    }
    
}