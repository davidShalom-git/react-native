import express from 'express';
import User from '../models/User.js';
const router = express.Router();
import jwt from 'jsonwebtoken';

const generateToken = (userId) => {
    return jwt.sign({userId},process.env.JWT_SECRET,{expiresIn: '30d'}
)}


router.post('/register',async (req,res)=> {
    try {

        const {Email,Username,Password} = req.body;

        if(!Email || !Username || !Password){
            return res.status(400).json({message:"All fields are required"})
        }
        if(Password.length < 6){
            return res.status(400).json({message:"Password must be at least 6 characters"})
        }
      
        // check if user exists

        // const existing = await User.findOne({$or : [{Email},{Username}]})
        // if(existing) {
        //     return res.status(400).json({message:"User already exists"})
        // }

        const existingEmail = await User.findOne({Email});
        if(existingEmail) {
            return res.status(400).json({message:"Email already exists"})
        }

        const existingName = await User.findOne({Username});
        if(existingName) {
            return res.status(400).json({message:"Username already exists"})
        }

        // get random avatar from api
        // const profileImage = `https://api.dicebear.com/5.x/initials/svg?seed=${Username}`
        const profileImage = `https://api.dicebear.com/5.x/avataaars/svg?seed=${Username}`   

        const user = new User({
            Email,
            Username,
            Password,
           profileImage
        })

        await user.save();

        const token = generateToken(user._id);
        res.status(201).json({
            token,
            user: {
                _id: user._id,
                Username: user.Username,
                Email: user.Email,
                ProfileImage: user.ProfileImage,
            }
        })
        
        
    } catch (error) {
        console.log("Error in register route",error)
        res.status(500).json({message: "Internal server error"})
    }
})


router.post('/login',async (req,res)=> {
    try {

        const {Email,Password} = req.body;

        if(!Email || !Password){
            return res.status(400).json({message:"All fields are required"})
        }

        // check if user exists
        const user = await User.findOne({Email});
        if(!user) {
            return res.status(400).json({message:"Invalid credentials"})
        }

        const isMatch = await user.comparePassword(Password);
        if(!isMatch) {
            return res.status(400).json({message:"Invalid credentials"})
        }

        const token = generateToken(user._id);
        res.json({
            token,
            user: {
                _id: user._id,
                Username: user.Username,
                Email: user.Email,
                ProfileImage: user.ProfileImage,
            }
        })  
        
    } catch (error) {
        console.log("Error in login route",error);
        res.status(500).json({message: "Internal server error"})  
    }
})

export default router;  