import express from "express";
import bodyParser from "body-parser";
import _ from "lodash";
import path from "path";
import mongoose from "mongoose";
import session from "express-session";
import passport from "passport";
import passportLocalMongoose from "passport-local-mongoose";
import connectEnsureLogin from "connect-ensure-login";
import LocalStrategy from "passport-local";
// import User from "./models/account";
const app = express();
const __dirname = path.resolve();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
app.use(session({  //Set up the express session configuration
    secret: 'tempsecretpass',
    resave: false,
    saveUninitialized: true,
    cookie: {MaxAge: 60*60*1000} //1 hour
}))
app.use(passport.initialize()); //Middleware to use Passport with Express
app.use(passport.session()); //Needed to use express-session with passport

mongoose.connect('mongodb://localhost:27017/NotesyDB', { useNewUrlParser: true, useUnifiedTopology: true });


// const User = mongoose.model("User", userSchema);
// const cat = {
//     title: "sample category",
//     desc: "Example of a category using Mongoose",
//     createTime: new Date(),
//     color: "black",
//     posts: [{
//         title: "Sample Note Title",
//         content: "Sample Note Content",
//         dueDate: "Sample Due Date"
//     }]
// }
// const Admin = new User({
//     email: "timothytuen45@gmail.com",
//     password: "password",
//     notes: [cat],
//     projects: []
// });
// Admin.save();

import User from './models/account.js';
// const User = require('./models/account.js');
passport.use(User.createStrategy()); //Configures the login strategy based on mongoose & passport-local-mongoose
// Otherwise, would need to create own strategy if didn't use
// When using sessions with Passport, new session begins as soon as user gets appropriately authenticated

// To use with sessions
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());





// User.find().then(function(users) {
//     users.forEach(function(user) {
//         console.log(user);
//         console.log("space");
//     })
// }).catch(function(err) {
//     console.log(err);
// });

let currUserId;

app.get("/", function(req,res) {
    res.render("welcome");
})

app.get("/home", connectEnsureLogin.ensureLoggedIn(), function(req, res) {
    res.render("home");
})

app.get("/list", connectEnsureLogin.ensureLoggedIn(), function(req, res) {
    console.log("notes & logged in");
    User.findOne({username: req.user.username}).then(function(postCategories) {
        console.log(postCategories);
        console.log(postCategories.notes);
        let categoriesArr = postCategories.notes;
        res.render("list", {categories: categoriesArr});
    }).catch(function(err) {
        console.log(err);
    });
}) 

app.get("/compose-category", connectEnsureLogin.ensureLoggedIn(), function(req, res) {
    res.render("composeCategory");
})

app.post("/compose-category", function (req, res) {
    const title = _.lowerCase(req.body.catTitle);
    const desc = req.body.catDesc;
    const color = req.body.catColor;
    const createTime = new Date();
    const cat = {
        title: title,
        desc: desc,
        createTime: createTime,
        color: color,
        posts: []
    }
    User.findOne({username: req.user.username}).then(function(user) {
        user.notes.push(cat);
        user.save().then(() => {
            console.log(user.notes);
            res.redirect("/task/" + title);
        });
    }).catch(function(err) {
        console.log(err);
    })
})

app.get("/task/:name", connectEnsureLogin.ensureLoggedIn(), function(req, res) {
    User.findOne({username: req.user.username}).then(function(userData) {
        const categoryIndex = userData.notes.findIndex(item => item.title === _.lowerCase(req.params.name));
        res.render("categoryTasks", {category: userData.notes[categoryIndex]});
    }).catch(function(err) {
        console.log(err);
    });

});

app.post("/task/:name", function(req, res) {
    User.findOne({username: req.user.username}).then(function(user) {
        const post = {
            title: req.body.postTitle,
            content: req.body.postInfo,
            dueDate: req.body.postDate
        }
        const categoryIndex = user.notes.findIndex(item => item.title === _.lowerCase(req.params.name));
        user.notes[categoryIndex].posts.push(post);
        user.markModified('notes'); //Previously not saving because didn't know it was modified due to posts being so deep into the object. Tell mongoDB there's a change here
        user.save().then(() => {
            console.log("SAVED");
            res.redirect("/task/" + req.params.name)
        });
        return;
    }).catch(function(err) {
        console.log(err);
    });
});

app.post("/task/:name/delete", function(req, res) {

    const task = req.body.deleteTask;
    User.findOne({username: req.user.username}).then(function(user) {
        const categoryIndex = user.notes.findIndex(item => item.title === _.lowerCase(req.params.name));
        const postIndex = user.notes[categoryIndex].posts.findIndex(item => item.title === task);
        user.notes[categoryIndex].posts.splice(postIndex, 1);
        user.markModified('notes');
        user.save().then(() => {
            res.redirect("/task/" + req.params.name);
        })
    }).catch(function(err) {
        console.log(err);
    })
})

app.post("/list/delete", function(req, res) {
    const cat = req.body.deleteCategory;
    User.findOne({username: req.user.username}).then(function(user) {
        const categoryIndex = user.notes.findIndex(item => item.title === cat);
        user.notes.splice(categoryIndex, 1);
        user.save().then(() => {
            res.redirect("/list");
        })
    }).catch(function(err) {
        console.log(err);
    })
})


app.get("/login", function(req, res) {
    res.render("signIn");
})

app.post("/login", passport.authenticate('local', {failureRedirect: '/login'}), function(req, res) {
    // const usernameSubmitted = req.body.username;
    // const passwordSubmitted = req.body.password;
    console.log(req.user)
    res.redirect("/home");
})

app.get("/create-account", function(req, res) {
    res.render("createAccount");
})

app.post("/create-account",  function(req, res) {
    const newUserEntry = new User({
        username: req.body.username,
        password: req.body.password,
        notes: [],
        projects: []
    });

    User.register(newUserEntry, req.body.password, function(err, user) {
        if(err){
            console.log(err);
            res.redirect("/create-account");
        } else {
            console.log(user + "2");
            passport.authenticate("local")(req, res, function() {
                res.redirect("/home")
            })
        }
    })

    // newUserEntry.save().then(() => {
    //     res.redirect("/home");
    // })
})

app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/login");
})


// function isLoggedIn(req, res, next) {
//     if(req.isAuthenticated()) return next();

//     res.redirect('/login')
// }


app.listen(3000, function() {
    console.log("server started on port 3000");
})

