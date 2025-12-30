import Patient from "./Patient.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt";

export const signup = async (req, res) => {
  try {
    const { name, phonenumber, password } = req.body;

    if (!name || !password || !phonenumber) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the fields",
      });
    }

    const existingPatient = await Patient.findOne({ phonenumber });
    if (existingPatient) {
      return res.json({
        success: false,
        message: "User already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await Patient.create({
      name,
      phonenumber,
      password: hashedPassword,
    });

    return res.json({
      success: true,
      message: "Account created successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const login=async(req,res)=>{
    try{
    const {phonenumber,password}=req.body;
     if(!password||!phonenumber){
        return res.status(401).json({success:false,message:"Please fill all the fields"});
      }
    const user=await Patient.findOne({phonenumber});
    if(!user){
        return res.json({success:false,message:"Incorrect phonenumber or password"});
    }
    const hash=user.password;
    const result=await bcrypt.compare(password,hash);
    if(!result){
       return res.json({success:false,message:"Incorrect Password"});
    }
      const key=process.env.JWT_SECRET||"secretkey";
      const token=jwt.sign({id:user._id},key,{expiresIn:"7d"});
      res.cookie("token",token,{
        httpOnly:true,
        sameSite:"none",
        secure :true
      })
      return res.json({success:true,message:"LoggedIN successfully"});
    }catch(err){
        console.log(err);
         return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
    }
}