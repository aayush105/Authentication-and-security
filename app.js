//jshint esversion:6
require("dotenv").config(); // to create dotenv to keeo secrets safe
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// const encrypt = require('mongoose-encryption');
// const md5 = require("md5");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();

// console.log(md5("12345"));  

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended : true }));

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true });

// an object created from mongoose schema class
const userSchema = new mongoose.Schema ({
    email : String,
    password : String
});


// only encrypt the password field
// userSchema.plugin(encrypt, { secret:process.env.SECRET, encryptedFields: ["password"] }); // a plugin can add additional fields, methods, middleware, or other behavior to the schema. 

const User = new mongoose.model("User", userSchema);

app.get("/", function(req, res){
    res.render("home");
});

app.get("/login", function(req, res){
    res.render("login");
});

app.get("/register",async function(req, res){

    res.render("register");
});


app.post("/register", async function(req, res){
  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    // Store hash in your password DB.
    try {
      const newUser = new User({
          email : req.body.username,
          // password : md5(req.body.password)
          password : hash
      });
      newUser.save();
      res.render("secrets");
  } catch(err){
      console.log(err);
  }
});
    
});

app.post("/login", async function(req, res) {
    try {
      const username = req.body.username;
      // const password = md5(req.body.password);
      const password = req.body.password;
  
      const foundUser = await User.findOne({ email: username }).exec();
      if (foundUser) {
        bcrypt.compare(password, foundUser.password, function(err, result) {
          // result == true
          if (result === true){
            res.render("secrets");
          }
      });   
      } else {
        res.status(404).send("User not found");
      }
    } catch (err) { 
      console.log(err);
      res.status(500).send("Internal Server Error");
    }
  });

app.listen(3000, function(){
    console.log("Server started at port 3000");
});