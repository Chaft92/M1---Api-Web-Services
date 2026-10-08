import mongoose from 'mongoose';

const Schema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    age: Number,
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    }
}, {
    collection: 'users',
    minimize: false,
    versionKey: false
});

export default Schema;
