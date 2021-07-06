const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

const user = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

const users = Mongoose.model('user', user);
module.exports = {
    users
};