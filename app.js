import express from "express";
import bodyParser from "body-parser";
import _ from "lodash";
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const categories = [];

app.get("/", function(req,res) {
    res.render("home");
})

app.get("/list", function(req, res) {
    res.render("list");
}) 

app.get("/compose-category", function(req, res) {
    res.render("composeCategory");
})

app.post("/compose-category", function (req, res) {
    const title = req.body.title;
    const desc = req.body.desc;
    const createTime = new Date();

    const cat = {
        title: title,
        desc: desc,
        createTime: createTime,
        posts: []
    }
    categories.push(cat);
    res.redirect("/tasks/`${title}`");
})

app.get("/tasks/:title", function(req, res) {

})

app.listen(3000, function() {
    console.log("server started on port 3000");
})

