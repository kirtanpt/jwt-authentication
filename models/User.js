const mongoose = require('mongoose');
const Scheme = new mongoose.Schema;

// create schema

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
    },
    password: {
        type: String
    },
    email: {
        type: String
    },
    verify:{
        type:Number,
        default:0
    },
    code: {
        type: String
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    }
});

module.exports = User = mongoose.model('users', UserSchema);
