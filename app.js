import express from "express";
import bodyParser from "body-parser";
import _ from "lodash";
import path from "path";
const app = express();
const __dirname = path.resolve();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));

// console.log(__dirname);

const categories = [];

app.get("/", function(req,res) {
    console.log("/");
    res.render("home");
})

app.get("/list", function(req, res) {
    console.log(categories);
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
    categories.push(cat);
    console.log("created category");
    // res.redirect("/");
    res.redirect("/task/" + title);
})

app.get("/task/:name", function(req, res) {
    // console.log(req.params);
    const result = categories.findIndex(item => item.title === _.lowerCase(req.params.name));
    // console.log(result);
    // console.log(categories[result]);
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
    console.log(task);
    console.log(req.body);
    const index = categories.findIndex(item => item.title === _.lowerCase(req.params.name));
    const postIndex = categories[index].posts.findIndex(item => item.title === task);
    console.log(postIndex);
    categories[index].posts.splice(postIndex, 1);
    res.redirect("/task/" + req.params.name);
})

app.listen(3000, function() {
    console.log("server started on port 3000");
})

