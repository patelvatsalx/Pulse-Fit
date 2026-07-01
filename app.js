const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

require('dotenv').config();

const userModel = require('./models/user');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error(err));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(cookieParser());

// 1. Home / Register Route (GET)
app.get('/', (req, res) => {
    res.render("index");
});
app.get("/sign", function(req, res){
    res.render('index')
})

app.get("/landing", function(req, res){
    res.render("landing")
})

app.post('/create', async (req, res) => {
    let { username, email, password, age } = req.body;

    
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, async (err, hash) => {
            if (err) return res.send("Something went wrong");

           
            let createdUser = await userModel.create({
                username,
                email,
                password: hash,
                age
            });

          
            let token = jwt.sign({ email: createdUser.email }, process.env.JWT_SECRET);
            res.cookie("token", token);
            res.send(createdUser);
        });
    });
});


app.get('/login', (req, res) => {
    res.render("login");
});


app.post('/login', async (req, res) => {
    let { email, password } = req.body;

    
    let user = await userModel.findOne({ email });
    if (!user) return res.send("Something went wrong");


    bcrypt.compare(password, user.password, (err, result) => {
        if (result) {
            let token = jwt.sign({ email: user.email }, process.env.JWT_SECRET);
            res.cookie("token", token);

            res.render("landing")
        } else {
            res.send("Something went wrong");
        }
        
    });
    
});


app.get('/logout', (req, res) => {

    res.cookie("token", "");
    res.redirect('/');
});



app.get("/delete", async function(req, res){
    let deluser = await userModel.deleteMany()
    res.send(userModel.username + "User Deleted")
})