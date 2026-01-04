import mongoose from "mongoose";

const HospitalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    image: {
      type: String, // URL or path
      required: false
    },

    address: {
      street: String,
      city: String,
      state: String,
      pincode: String
    },

    contact: {
      phone: String,
      email: String
    },
    doctors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Doctor" }],

    establishedYear: Number,
    isPrivate: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("Hospital", HospitalSchema);
