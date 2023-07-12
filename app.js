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

const userSchema = new mongoose.Schema({
    // userID: {
    //     type: Number,
    //     required: true
    // },
    email: {
        type: email,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    posts: {
        type: Array
    },
    projects: {
        type: Array
    }
});
const User = mongoose.model("User", userSchema);

let signedIn = false;
const categories = [];

if(signedIn) {
    app.get("/", function(req,res) {
        res.render("home");
    })

    app.get("/list", function(req, res) {
        res.render("list", {categories: categories});
    }) 
    
    app.get("/compose-category", function(req, res) {
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
        // categories.push(cat);
        User.updateMany({email: req.user.email}, {$push: {posts: cat}}) //Push the new category to the posts array in the user's database entry
        res.redirect("/task/" + title);
    })
    
    app.get("/task/:name", function(req, res) {
        // const result = categories.findIndex(item => item.title === _.lowerCase(req.params.name));
        const result = User.find({email: req.user.email}, 'posts').findIndex(item => item.title === _.lowerCase(req.params.name));
        res.render("categoryTasks", {category: categories[result]});
    });
    
    app.post("/task/:name", function(req, res) {
        const result = categories.findIndex(item => item.title === _.lowerCase(req.params.name));
        const post = {
            title: req.body.postTitle,
            content: req.body.postInfo,
            dueDate: req.body.postDate
        }
        categories[result].posts.push(post);
        res.redirect("/task/" + req.params.name);
    });
    
    app.post("/task/:name/delete", function(req, res) {
    
        const task = req.body.deleteTask;
        const index = categories.findIndex(item => item.title === _.lowerCase(req.params.name));
        const postIndex = categories[index].posts.findIndex(item => item.title === task);
        categories[index].posts.splice(postIndex, 1);
        res.redirect("/task/" + req.params.name);
    })
    
    app.post("/list/delete", function(req, res) {
        const cat = req.body.deleteCategory;
        const index = categories.findIndex(item => item.title === cat);
        categories.splice(index, 1);
        res.redirect("/list");
    })
} else {

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
        if(passwordCreated != passwordCheck) {
            alert("Password fields do not match");
            validAccount = false;
        } 
        if(emailCreated is taken){
            alert("Email has already been registered");
            validAccount = false;
        }

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
}




app.listen(3000, function() {
    console.log("server started on port 3000");
})

