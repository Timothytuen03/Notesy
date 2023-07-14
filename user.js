import mongoose from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";

mongoose.connect('mongodb://localhost:27017/NotesyDB', { useNewUrlParser: true, useUnifiedTopology: true });


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    notes: {
        type: Array
    },
    projects: {
        type: Array
    }
});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', userSchema);