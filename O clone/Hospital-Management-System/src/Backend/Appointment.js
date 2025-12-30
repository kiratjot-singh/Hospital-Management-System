import mongoose from "mongoose";
const appointmentSchema=new mongoose.Schema({
    hospital:{type:mongoose.Schema.Types.ObjectId,ref:hospitals},
    doctor:{type:mongoose.Schema.Types.ObjectId,ref:doctors},
    location:String,
    date:{type:Date},
      slot: {
    start: {
      type: String,  
      required: true
    },
    end: {
      type: String,   
      required: true
    }
  },
  status:{
    type: String,
    enum: ["booked", "cancelled", "completed"]
  }
})
export default mongoose.model(Appointment,appointmentSchema);