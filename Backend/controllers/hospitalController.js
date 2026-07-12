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

export const updateHospital = async (req, res) => {
  const { id } = req.params;
  const { name, address, contact, establishedYear, isPrivate, image } = req.body;

  try {
    const updatedHospital = await Hospital.findByIdAndUpdate(
      id,
      {
        name,
        address,
        contact,
        establishedYear: Number(establishedYear) || undefined,
        isPrivate: isPrivate === true || isPrivate === "true",
        image
      },
      { new: true }
    );

    if (!updatedHospital) {
      return res.status(404).json({ success: false, message: "Hospital not found" });
    }

    return res.json({
      success: true,
      message: "Hospital details updated successfully",
      hospital: updatedHospital
    });
  } catch (err) {
    console.error("Error updating hospital:", err);
    return res.status(500).json({
      success: false,
      message: "Server error updating hospital details",
    });
  }
};

export const getHospitalById = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ success: false, message: "Hospital not found" });
    }
    return res.json({ success: true, hospital });
  } catch (err) {
    console.error("Error fetching hospital by ID:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};