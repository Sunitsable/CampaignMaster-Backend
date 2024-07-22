const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Userschema = new Schema({
    
    email: String,
    password: String
});

const Users = mongoose.model('user', Userschema);

module.exports = Users;
