import Department from "../models/Department.js";
import Doctor from "../models/Doctor.js";
import Hospital from "../models/Hospital.js";   
import bcrypt from "bcryptjs";

// ---------------- Doctor Signup ----------------
export const doctorSignup = async (req, res) => {
  try {
    const { name, phone, password, hospitalId, departments } = req.body;

    
    if (
      !name ||
      !phone ||
      !password ||
      !hospitalId ||
      !departments ||
      departments.length === 0
    ) {
      return res.json({
        success: false,
        message: "All fields required",
      });
    }

    
    const exists = await Doctor.findOne({ phone });
    if (exists) {
      return res.json({
        success: false,
        message: "Phone already registered",
      });
    }

    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.json({
        success: false,
        message: "Invalid hospital selected",
      });
    }

 
    const hashedPassword = await bcrypt.hash(password, 10);


    const doctor = await Doctor.create({
      name,
      phone,
      password: hashedPassword,
      hospital: hospitalId,
      departments,
    });

   
    await Hospital.findByIdAndUpdate(hospitalId, {
      $push: { doctors: doctor._id },
    });

    
    await Department.updateMany(
      { _id: { $in: departments } },
      { $push: { doctors: doctor._id } }
    );

    return res.json({
      success: true,
      doctor,
    });

  } catch (err) {
    console.log("Doctor signup error:", err);
    return res.json({
      success: false,
      message: err.message,
    });
  }
};

export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate("hospital")   // if doctor belongs to a hospital
      .exec();

    if (!doctor) {
      return res.json({ success: false, message: "Doctor not found" });
    }

    res.json({ success: true, doctor });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: "Server error" });
  }
};



// ---------------- Doctor Login ----------------
export const doctorLogin = async (req, res) => {
  try {
    const { phone, password } = req.body;

    const doctor = await Doctor.findOne({ phone });
    if (!doctor) {
      return res.json({ success: false, message: "Doctor not found" });
    }

    const match = await bcrypt.compare(password, doctor.password);
    if (!match) {
      return res.json({ success: false, message: "Wrong password" });
    }

    return res.json({ success: true, doctor });

  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
};
export const getDepartments=async(req,res)=>{
  const {hospitalId}=req.body;
  try{
    const departments=await Department.find({hospital:hospitalId});
    if(!departments){
      return res.json({success:false,message:"cannot get departments"});
    }
    return res.json({success:true,departments});
  }catch(err){
     return res.json({ success: false, message: err.message });
  }
}
export const getDoctorsByDepartment = async (req, res) => {
  try {
    const deptId = req.params.id;

    const doctors = await Doctor.find({
      departments: deptId,
      active: true,
      available: true,
    })
      .select("-password -otp -otpExpires") 
    return res.status(200).json({
      success: true,
      doctors,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};