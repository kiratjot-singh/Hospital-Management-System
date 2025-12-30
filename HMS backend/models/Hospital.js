import mongoose from "mongoose";


const HospitalSchema = new mongoose.Schema({
    name:{type:String,required:true},
    doctors:[{type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: false}],
    
    
    
  })
export default mongoose.model("Hospital",HospitalSchema);