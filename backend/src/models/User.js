import mongoose from "mongoose";
import bcrypt from "bcryptjs";


const userSchema = new mongoose.Schema({
    Username: {
        type:String,
        required:true,
        unique:true,
    },
   
    Email: {
        type:String,
        required:true,
        unique:true,
    },

    Password: {
        type:String,
        required:true,
        minlengthL: 6
    },

    ProfileImage: {
        type: String,
        default: "",
    },
},{timestamps:true});

// hash password before saving to database
userSchema.pre("save",async function(next){

    if(!this.isModified("Password")){
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.Password = await bcrypt.hash(this.Password,salt);
    next();

})

// compare password function
userSchema.methods.comparePassword = async function(userPassword){
    return await bcrypt.compare(userPassword, this.Password)
};

const User = mongoose.model('user',userSchema)



export default User;
