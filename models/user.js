const mongoose = require('mongoose');

// Connecting to local MongoDB instance
mongoose.connect("mongodb://127.0.0.1:27017/Workout_auth");

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    age: Number
});

module.exports = mongoose.model('user', userSchema);