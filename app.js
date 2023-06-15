//jshint esversion:6
require("dotenv").config(); // to create dotenv to keeo secrets safe
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

// Method to encrypt the password
// const encrypt = require('mongoose-encryption');
// const md5 = require("md5");
// const bcrypt = require("bcrypt");
// const saltRounds = 10;

// passportJS to add cookies and session
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;
const passportLocalMongoose = require("passport-local-mongoose");


const app = express();

// console.log(md5("12345"));  

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended : true }));


// this should be placed here only for working properly
app.use(session({
  secret: "Our little secret.", 
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize()); //used for the authentication of the password || initiliaze passport
app.use(passport.session()); // also deal with session 
 

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true });

// an object created from mongoose schema class
const userSchema = new mongoose.Schema ({
    email : String,
    password : String
});

// used to hash and salt then save the data into database
userSchema.plugin(passportLocalMongoose); 

// only encrypt the password field
// userSchema.plugin(encrypt, { secret:process.env.SECRET, encryptedFields: ["password"] }); // a plugin can add additional fields, methods, middleware, or other behavior to the schema. 

const User = new mongoose.model("User", userSchema);

// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate())); //used to create local login strategy

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req, res){
    res.render("home");
});

app.get("/login", function(req, res){
    res.render("login");
});

app.get("/register",async function(req, res){

    res.render("register");
});

app.get("/secrets", function(req,res){
  if(req.isAuthenticated()){
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
});

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});

app.post("/register", async function(req, res){
//   bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
//     // Store hash in your password DB.
//     try {
//       const newUser = new User({
//           email : req.body.username,
//           // password : md5(req.body.password)
//           password : hash
//       });
//       newUser.save();
//       res.render("secrets");
//   } catch(err){
//       console.log(err);
//   }
// });

  User.register({username: req.body.username}, req.body.password, function(err, user){
    if (err){
      console.log(err);
      res.render("/register");
    } else {
      // used to authenticate the user using passport
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      })
    }
  })

});

app.post("/login", async function(req, res) {
    // try {
    //   const username = req.body.username;
    //   // const password = md5(req.body.password);
    //   const password = req.body.password;
  
    //   const foundUser = await User.findOne({ email: username }).exec();
    //   if (foundUser) {
    //     bcrypt.compare(password, foundUser.password, function(err, result) {
    //       // result == true
    //       if (result === true){
    //         res.render("secrets");
    //       }
    //   });   
    //   } else {
    //     res.status(404).send("User not found");
    //   }
    // } catch (err) { 
    //   console.log(err);
    //   res.status(500).send("Internal Server Error");
    // }
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });
  
  // this methos comes from passport
  req.login(user, function(err){
    if (err){
      console.log(err);
    } else {
      // used to authenticate the user using passport
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      })
    }
  })
    
  });

app.listen(3000, function(){
    console.log("Server started at port 3000");
});