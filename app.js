const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userModel = require('./models/user');

// Middlewares & view engine configuration
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..')));
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

// 2. Handle Registration (POST)
app.post('/create', async (req, res) => {
    let { username, email, password, age } = req.body;

    // Generate salt and hash the password
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, async (err, hash) => {
            if (err) return res.send("Something went wrong");

            // Save the user with encrypted password
            let createdUser = await userModel.create({
                username,
                email,
                password: hash,
                age
            });

            // Issue JWT token upon registration completion
            let token = jwt.sign({ email: createdUser.email }, "shhhhhsecretkey");
            res.cookie("token", token);
            res.send(createdUser);
        });
    });
});

// 3. Login Page Route (GET)
app.get('/login', (req, res) => {
    res.render("login");
});

//4. Handle Login Authentications (POST)
app.post('/login', async (req, res) => {
    let { email, password } = req.body;

    // Look up user by email
    let user = await userModel.findOne({ email });
    if (!user) return res.send("Something went wrong"); // Obscured message for security

    // Compare user plane text input password with the stored hash password
    bcrypt.compare(password, user.password, (err, result) => {
        if (result) {
            // If match, sign a new JWT token and store inside cookies
            let token = jwt.sign({ email: user.email }, "shhhhhsecretkey");
            res.cookie("token", token);
            // res.send("Yes, you can login.");
            res.render("landing")
        } else {
            res.send("Something went wrong"); // Uniform response prevents user/email enumeration attacks
        }
        
    });
    
});

// 5. Logout Route (GET)
app.get('/logout', (req, res) => {
    // Clear cookie by setting token value empty
    res.cookie("token", "");
    res.redirect('/');
});

app.get("/show", async function(req, res){
    let allusers = await userModel.find()
    res.send(allusers)
})

app.get("/delete", async function(req, res){
    let deluser = await userModel.deleteMany()
    res.send(userModel.username + "User Deleted")
})

// Start server
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});