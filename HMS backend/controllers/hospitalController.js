import Hospital from "../models/Hospital.js";

export const getHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find({}, "name _id"); // only name + id
    
    return res.json({
      success: true,
      hospitals,
    });
  } catch (err) {
    console.error("Error fetching hospitals:", err);
    return res.json({
      success: false,
      message: "Server error",
    });
  }
};