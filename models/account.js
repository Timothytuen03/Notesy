import mongoose from "mongoose";
import passportLocalMongoose from 'passport-local-mongoose';

let Schema = mongoose.Schema;

let Account = new Schema({
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
    },
    completedNotes: {
        type: Array
    },
    completedProjects: {
        type: Array
    }
})

Account.plugin(passportLocalMongoose);

const User = mongoose.model('User', Account);
export default User;