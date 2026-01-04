import mongoose from "mongoose"
const departmentSchema=new mongoose.Schema({
    name:{type:String,required:true},
     doctors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Doctor" }],
    hospital:{type:mongoose.Schema.Types.ObjectId,ref:"Hospital",required:true}
});

export default mongoose.model("Department",departmentSchema)