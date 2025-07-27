const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();
const {body, validationResult} = require('express-validator');

const userModel = require('../models/user.model')

const  bcrypt = require('bcrypt')

router.get('/register',(req,res)=>{
    res.render('register')
})

router.post('/register',
    body('email').trim().isEmail().isLength({min:13}),
    body('password').trim().isLength({min:5}),
    body('username').trim().isLength({min:3}),
    async (req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({
            errors:errors.array(),
            message:"invalid credentials"
        })
         
    }
    const {email,username,password} = req.body;
      
    const hashPassword = await bcrypt.hash(password, 10);
    console.log("Registering User:");
console.log("Email:", email);
console.log("Username:", username);
console.log("Password (plain):", password);
console.log("Password (hashed):", hashPassword);

    const newUser = await userModel.create({
        email,
        username,
        password : hashPassword
        
    })
    console.log("User saved:", newUser);


res.json(newUser)

})

router.get('/login',(req,res)=>{
    res.render('login')
})

router.post('/login', 
     body('password').trim().isLength({min:5}),
    body('username').trim().isLength({min:3}),
    async (req,res)=>{
const errors = validationResult(req);

if(!errors.isEmpty()){
    return res.status(400).json({
        errors:errors.array(),
        messsage:"invalid credentials"
    })
}

const {username, password} = req.body;

const user = await userModel.findOne({
    username : username,
   
})

if(!user){
    return res.status(400).json({
        
        message:"invalid username or password "
    })
}

console.log("Logging In...");
console.log("Entered Username:", username);
console.log("Entered Password:", password);


const isMatch = await bcrypt.compare(password, user.password);

console.log("Found User:", user);
console.log("Stored Hashed Password:", user.password);
console.log("Password Match:", isMatch);


   if(!isMatch){
    return res.status(400).json({
        
        message:"invalid username or password"
    })
   
}




const token = jwt.sign({
    userId: user._id,
    email:user.email,
    username : user.username,
   
},

process.env.JWT_SECRET,)
res.send(token)
})
module.exports = router;