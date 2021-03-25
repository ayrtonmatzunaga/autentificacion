// sempre va primero el dotenv
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose")
const encrypt = require("mongoose-encryption")

const app = express();

// el archivo .env guarda todos los secrets key
// asi se llama al valor que hay en el API_KEY en el .env
console.log(process.env.API_KEY);

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

mongoose.connect("mongodb://localhost:27017/userDB",{ useNewUrlParser: true, useUnifiedTopology: true })

// lo transformo en un object de mongoose para usar la encriptacion de mongoose
// antes era definido como un object de javascript
const userSchema = new mongoose.Schema({
  email: String,
  password: String
})

// creo un const secret (encryption key) que sera llamado despues con plugin para encriptar todo lo que use el Schema userSchema
// con encryptedFields digo que quiero encryptar
// sin encryptedFields se encriptaria todo el document
// si quiero encriptar otros campos solo poner , y seguir mencionando ["pass", "nombre", "etc"]
userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields:["password"]})

// aca userSchema ya estara encriptado porque esta antes definido
const User = new mongoose.model("User", userSchema)

app.get("/", function(req,res){
  res.render("home.ejs")
})

app.get("/login", function(req,res){
  res.render("login.ejs")
})

app.get("/register",function(req,res){
  res.render("register.ejs")
})

app.post("/register", function(req,res){
  const newUser = new User({
    email: req.body.username,
    password: req.body.password
  })

  newUser.save(function(err){
    if(err){
      console.log(err);
    }
    else{
      res.render("secrets.ejs")
    }
  })
})

app.post("/login", function(req,res){
  const username = req.body.username
  const password = req.body.password

  User.findOne({email: username}, function(err, foundUser){
    if(err){
      console.log(err);
    }
    else{
      if(foundUser){
        if(foundUser.password === password){
          res.render("secrets")
        }
      }
    }
  })
})

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
