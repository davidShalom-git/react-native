import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protectedRoute = async (req,res,next) => {
    try {

        const token = req.header("Authorization").replace("Bearer ","");
        if(!token) {
            return res.status(401).json({message:"Unauthorized"})
        }

        // verify token
        const decoed = jwt.verify(token.process.env.JWT_SECRET);
        
        // find user

        const user = await User.findById(decoed.userId).select("-Password")

        if(!user) {
            return res.status(401).json({message:"Unauthorized"})
        }
        req.user = user;
        next();
        
    } catch (error) {
        console.log("Error in protected route",error);
        res.status(401).json({message:"Unauthorized"})
    }
}

export default protectedRoute;