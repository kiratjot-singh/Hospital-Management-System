import mongoose from "mongoose";
const PatientSchema=new mongoose.Schema({
   phonenumber:{type:String,required:true},
   password:{type:String,required:true},
   name:{type:String,required:true},
   state:String,
   district:String,
  bookedAppointments:[{type:mongoose.Schema.Types.ObjectId,ref:"Appointment"}],
  savedHospitals:[{type:mongoose.Schema.Types.ObjectId,ref:"hospitals"}],
//   myReports:[{types:mongoose.Schema.Types.ObjectId,ref:"reports"}],
   previousAppointements:[{type:mongoose.Schema.Types.ObjectId,ref:"Appointment"}]
});
export default mongoose.model("patient",PatientSchema);