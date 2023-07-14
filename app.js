import express from "express";
import bodyParser from "body-parser";
import _ from "lodash";
import path from "path";
import mongoose from "mongoose";
const app = express();
const __dirname = path.resolve();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
mongoose.connect('mongodb://localhost:27017/NotesyDB', { useNewUrlParser: true });

// const categorySchema

const userSchema = new mongoose.Schema({
    email: {
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
const User = mongoose.model("User", userSchema);
const cat = {
    title: "sample category",
    desc: "Example of a category using Mongoose",
    createTime: new Date(),
    color: "black",
    posts: [{
        title: "Sample Note Title",
        content: "Sample Note Content",
        dueDate: "Sample Due Date"
    }]
}
const Admin = new User({
    email: "timothytuen45@gmail.com",
    password: "password",
    notes: [cat],
    projects: []
});
// Admin.save();


// User.find({email: "timothytuen45@gmail.com"}).posts
User.find().then(function(users) {
    users.forEach(function(user) {
        console.log(user);
        console.log("space");
    })
}).catch(function(err) {
    console.log(err);
});

let signedIn = true;

    app.get("/", function(req,res) {
        if(signedIn) {
            res.render("home");
        } else {
            res.redirect("/sign-in");
        }
    })

    app.get("/list", function(req, res) {
        if(signedIn) {
            User.findOne({email: "timothytuen45@gmail.com"}).then(function(postCategories) {
                let categoriesArr = postCategories.notes;
                res.render("list", {categories: categoriesArr});
            }).catch(function(err) {
                console.log(err);
            });
        } else {
            res.redirect("/sign-in")
        }
    }) 
    
    app.get("/compose-category", function(req, res) {
        if(signedIn) {
            res.render("composeCategory");
        } else {
            res.redirect("/sign-in")
        }
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
        User.findOne({email: "timothytuen45@gmail.com"}).then(function(user) {
            user.notes.push(cat);
            user.save().then(() => {
                console.log(user.notes);
                res.redirect("/task/" + title);
            });
        }).catch(function(err) {
            console.log(err);
        })
    })
    
    app.get("/task/:name", function(req, res) {
        console.log("get task");
        if(signedIn) {
            User.findOne({email: "timothytuen45@gmail.com"}).then(function(userData) {
                const categoryIndex = userData.notes.findIndex(item => item.title === _.lowerCase(req.params.name));
                res.render("categoryTasks", {category: userData.notes[categoryIndex]});
            }).catch(function(err) {
                console.log(err);
            });
        } else {
            res.redirect("/sign-in")
        }

    });
    
    app.post("/task/:name", function(req, res) {
        User.findOne({email: "timothytuen45@gmail.com"}).then(function(user) {
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
        User.findOne({email: "timothytuen45@gmail.com"}).then(function(user) {
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
        User.findOne({email: "timothytuen45@gmail.com"}).then(function(user) {
            const categoryIndex = user.notes.findIndex(item => item.title === cat);
            user.notes.splice(categoryIndex, 1);
            user.save().then(() => {
                res.redirect("/list");
            })
        }).catch(function(err) {
            console.log(err);
        })
    })


    app.get("/sign-in", function(req, res) {
        res.render("signIn");
    })

    app.post("/sign-in", function(req, res) {
        const usernameSubmitted = req.body.username;
        const passwordSubmitted = req.body.password;
    })
    
    app.get("/create-account", function(req, res) {
        res.render("createAccount");
    })

    app.post("/create-account", function(req, res) {
        let validAccount = true;
        const passwordCreated = req.body.password;
        const passwordCheck = req.body.passwordTwo;
        const emailCreated = req.body.email;
        // if(passwordCreated != passwordCheck) {
        //     alert("Password fields do not match");
        //     validAccount = false;
        // } 
        // if(emailCreated is taken){
        //     alert("Email has already been registered");
        //     validAccount = false;
        // }

        if(validAccount) {
            signedIn = true;
            const newUer = new User({
                email: emailCreated,
                password: passwordCreated,
                posts: [],
                projects: []
            })

            // res.redirect("/");
        }
    })





app.listen(3000, function() {
    console.log("server started on port 3000");
})

