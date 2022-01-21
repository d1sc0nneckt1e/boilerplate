const router = require("express").Router();
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post("/", async (req, res)=>{
    console.log(req.body);
    try{
        const {email, password, passwordVerify} = req.body;

        if(!email || !password || !passwordVerify){
            return res.status(400).json({errorMessage: "Please fill all fields"});
        }
        if(password.length < 8){
            return res.status(400).json({errorMessage: "Please enter min 8 char for Password"});
        }
        if(password !== passwordVerify){
            return res.status(400).json({errorMessage: "Please enter the same Password twice"});
        }

        const existingUser = await User.findOne({email});
        console.log(existingUser);

        if(existingUser){
            return res.status(400).json({errorMessage: "User already exist!"});
        }

        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password,salt);

        console.log("hash: ",passwordHash,salt);

        const newUser = new User({
            email, passwordHash
        });

        const savedUser = await newUser.save();

        const token = jwt.sign({
                user: savedUser._id
            }, process.env.JWT_SECRET
        );

        console.log("token: ",token);

        res.cookie("token",token,{
            httpOnly:true
        }).send();

    }catch (err){
        console.error(err);
        res.status(500).send();
    }
});

router.get('/', async (req, res) => {
    res.send('Wiki home page');
});

router.post("/login", async (req, res)=>{
    console.log("login ");
    try{
        const {email, password} = req.body;
        if(!email || !password){
            return res.status(400).json({errorMessage: "Please fill all fields"});
        }
        const existingUser = await User.findOne({email});
        if(!existingUser){
            return res.status(401).json({errorMessage: "Wrong Email or Password"});
        }
        const isPasswordCorrect = await bcrypt.compare(password, existingUser.passwordHash);
        if(!isPasswordCorrect){
            return res.status(401).json({errorMessage: "Wrong Email or Password"});
        }

        const token = jwt.sign({
                user: existingUser._id
            }, process.env.JWT_SECRET
        );

        console.log("login token: ",token);

        res.cookie("token",token,{
            httpOnly:true
        }).send();
    }catch (err){
        console.error(err);
        res.status(500).send();
    }
});

router.get("/logout", async (req, res)=>{
    console.log("login ");  
    res.cookie("token","",{
        httpOnly:true,
        expires: new Date(0)
    }).send();
});

module.exports = router;