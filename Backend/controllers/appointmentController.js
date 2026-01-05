import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";

/* ---------------------------------- */
/* Utilities                          */
/* ---------------------------------- */

const generateSlots = (start, end, duration) => {
  const slots = [];
  let [h, m] = start.split(":").map(Number);
  let startMin = h * 60 + m;

  let [eh, em] = end.split(":").map(Number);
  let endMin = eh * 60 + em;

  while (startMin + duration <= endMin) {
    const s = startMin;
    const e = startMin + duration;

    const format = (x) =>
      String(Math.floor(x / 60)).padStart(2, "0") +
      ":" +
      String(x % 60).padStart(2, "0");

    slots.push(`${format(s)}-${format(e)}`);
    startMin += duration;
  }

  return slots;
};

const normalizeDate = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

/* ---------------------------------- */
/* Book Appointment                   */
/* ---------------------------------- */

export const bookAppointment = async (req, res) => {
  try {
    const { doctor, patient, hospital, date, slot, reason } = req.body;

    if (!doctor || !patient || !hospital || !date || !slot) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const doctorDoc = await Doctor.findById(doctor);
    if (!doctorDoc) return res.status(404).json({ message: "Doctor not found." });

    const bookingDate = new Date(date);
    if (bookingDate < new Date()) {
      return res.status(400).json({ message: "Cannot book appointment in the past." });
    }

    const validSlots = generateSlots(
      doctorDoc.workingHours.start,
      doctorDoc.workingHours.end,
      doctorDoc.slotDuration || 15
    );

    if (!validSlots.includes(slot)) {
      return res.status(400).json({ message: "Invalid slot selected." });
    }

    const dayStart = normalizeDate(date);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const exists = await Appointment.findOne({
      doctor,
      hospital,
      slot,
      date: { $gte: dayStart, $lte: dayEnd },
      status: "booked",
    });

    if (exists) {
      return res.status(400).json({ message: "This slot is already booked." });
    }

    const appointment = await Appointment.create({
      doctor,
      patient,
      hospital,
      date: bookingDate,
      slot,
      reason,
    });

    res.status(201).json({ success: true, appointment });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Slot already booked." });
    }
    res.status(500).json({ message: err.message });
  }
};

/* ---------------------------------- */
/* Get Free Slots                     */
/* ---------------------------------- */

export const getFreeSlots = async (req, res) => {
  try {
    const { doctor, hospital, date } = req.query;

    if (!doctor || !hospital || !date) {
      return res.status(400).json({ message: "Missing parameters." });
    }

    const doctorDoc = await Doctor.findById(doctor);
    if (!doctorDoc) return res.status(404).json({ message: "Doctor not found." });

    const allSlots = generateSlots(
      doctorDoc.workingHours.start,
      doctorDoc.workingHours.end,
      doctorDoc.slotDuration || 15
    );

    const dayStart = normalizeDate(date);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const booked = await Appointment.find({
      doctor,
      hospital,
      date: { $gte: dayStart, $lte: dayEnd },
      status: "booked",
    }).select("slot");

    const bookedSlots = booked.map((b) => b.slot);

    const freeSlots = allSlots.filter((s) => !bookedSlots.includes(s));

    res.json({ success: true, freeSlots });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------------------------------- */
/* Get Appointments by Doctor         */
/* ---------------------------------- */

export const getDoctorAppointments = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const appointments = await Appointment.find({ doctor: doctorId })
      .populate("patient")
      .sort({ date: 1 });

    res.json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------------------------------- */
/* Get Appointments by Patient        */
/* ---------------------------------- */

export const getPatientAppointments = async (req, res) => {
  try {
    const { patientId } = req.params;

    const appointments = await Appointment.find({ patient: patientId })
      .populate("doctor")
      .sort({ date: 1 });

    res.json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------------------------------- */
/* Update Appointment Status          */
/* ---------------------------------- */

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["booked", "cancelled", "completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!appointment) return res.status(404).json({ message: "Appointment not found." });

    res.json({ success: true, appointment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
