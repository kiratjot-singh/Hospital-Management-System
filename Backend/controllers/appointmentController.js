import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import Slot from "../models/Slot.js";
import Patient from "../models/Patient.js";
import mongoose from "mongoose";

export const generateSlots = (start, end, duration) => {
  const slots = [];
  let [h, m] = start.split(":").map(Number);
  let startMin = h * 60 + m;

  let [eh, em] = end.split(":").map(Number);
  let endMin = eh * 60 + em;

  const format = (x) =>
    String(Math.floor(x / 60)).padStart(2, "0") +
    ":" +
    String(x % 60).padStart(2, "0");

  while (startMin + duration <= endMin) {
    slots.push(`${format(startMin)}-${format(startMin + duration)}`);
    startMin += duration;
  }

  return slots;
};

const normalizeDate = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const cleanPastEmptySlots = async (doctorId) => {
  try {
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Delete all empty/blocked slots for dates strictly in the past
    await Slot.deleteMany({
      doctor: doctorId,
      date: { $lt: today },
      status: { $ne: "booked" }
    });

    // 2. Delete empty/blocked slots for today that have already passed in time
    const todaySlots = await Slot.find({
      doctor: doctorId,
      date: today,
      status: { $ne: "booked" }
    });

    const slotsToDelete = [];
    for (const s of todaySlots) {
      const slotStartStr = s.slot.split("-")[0];
      const [h, m] = slotStartStr.split(":").map(Number);
      const slotTime = new Date(today);
      slotTime.setHours(h, m, 0, 0);
      if (slotTime < now) {
        slotsToDelete.push(s._id);
      }
    }

    if (slotsToDelete.length > 0) {
      await Slot.deleteMany({ _id: { $in: slotsToDelete } });
    }
  } catch (err) {
    console.error("Error cleaning past empty slots:", err);
  }
};

/* ---------------------------------- */
/* Book Appointment                   */
/* ---------------------------------- */

export const bookAppointment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { doctor, hospital, date, slot, reason, patient } = req.body;

    if (!doctor || !patient || !hospital || !date || !slot) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Clean past empty slots first
    await cleanPastEmptySlots(doctor);

    // 1. Booking Horizon Validation (2 months / 60 days)
    const bookingDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const horizonDate = new Date(today);
    horizonDate.setDate(horizonDate.getDate() + 60);

    const normalizedBookingDate = new Date(`${date}T00:00:00.000Z`);
    if (normalizedBookingDate < today || normalizedBookingDate > horizonDate) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "Appointments can only be scheduled within the 2-month booking horizon (next 60 days).",
      });
    }

    // Ensure slot is not in the past
    const slotStartStr = slot.split("-")[0];
    const [slotHour, slotMin] = slotStartStr.split(":").map(Number);
    const slotDateTime = new Date(normalizedBookingDate);
    slotDateTime.setHours(slotHour, slotMin, 0, 0);

    const now = new Date();
    if (slotDateTime < now) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "Cannot book appointments in the past.",
      });
    }

    const doctorDoc = await Doctor.findById(doctor).session(session);
    if (!doctorDoc) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Doctor not found." });
    }

    // 2. Ensure slot documents exist (lazy-generate inside transaction if needed)
    let slotDoc = await Slot.findOne({
      doctor,
      hospital,
      date: normalizedBookingDate,
      slot,
    }).session(session);

    if (!slotDoc) {
      if (!doctorDoc.workingHours?.start || !doctorDoc.workingHours?.end) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: "Doctor working hours not configured" });
      }

      const allSlots = generateSlots(
        doctorDoc.workingHours.start,
        doctorDoc.workingHours.end,
        doctorDoc.slotDuration || 15
      );

      if (!allSlots.includes(slot)) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: "Invalid slot selected." });
      }

      const slotsToCreate = allSlots.map((s) => ({
        doctor,
        hospital,
        date: normalizedBookingDate,
        slot: s,
        status: "free",
        patient: null,
        appointment: null,
      }));

      try {
        await Slot.insertMany(slotsToCreate, { ordered: false, session });
      } catch (err) {
        if (err.code !== 11000 && !(err.writeErrors && err.writeErrors.some(e => e.code === 11000))) {
          throw err;
        }
      }

      slotDoc = await Slot.findOne({
        doctor,
        hospital,
        date: normalizedBookingDate,
        slot,
      }).session(session);
    }

    // 3. Atomically Reserve the Slot
    if (!slotDoc || slotDoc.status !== "free") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "This slot is already booked." });
    }

    // Create the appointment
    const appointmentArray = await Appointment.create(
      [
        {
          doctor,
          patient,
          hospital,
          date: bookingDate,
          slot,
          reason,
          status: "booked",
        },
      ],
      { session }
    );
    const appointment = appointmentArray[0];

    // Link slot to appointment & patient
    slotDoc.status = "booked";
    slotDoc.patient = patient;
    slotDoc.appointment = appointment._id;
    await slotDoc.save({ session });

    // Link appointment to patient
    await Patient.findByIdAndUpdate(
      patient,
      { $push: { bookedAppointments: appointment._id } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ success: true, appointment });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    if (err.code === 11000) {
      return res.status(400).json({ message: "Slot already booked." });
    }
    res.status(500).json({ message: err.message });
  }
};

/* ---------------------------------- */
/* Get Doctor Slots                   */
/* ---------------------------------- */

export const getDoctorSlots = async (req, res) => {
  try {
    const { doctor, hospital, date } = req.query;

    if (!doctor || !hospital || !date) {
      return res.status(400).json({
        success: false,
        message: "Missing parameters",
      });
    }

    // Validation for booking horizon
    const targetDate = new Date(`${date}T00:00:00.000Z`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const horizonDate = new Date(today);
    horizonDate.setDate(horizonDate.getDate() + 60);

    if (targetDate < today || targetDate > horizonDate) {
      return res.status(400).json({
        success: false,
        message: "Appointments can only be scheduled within the 2-month booking horizon (next 60 days).",
      });
    }

    const doctorDoc = await Doctor.findById(doctor);
    if (!doctorDoc) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Clean past empty slots first
    await cleanPastEmptySlots(doctor);

    // Lazy generation check
    let slots = await Slot.find({ doctor, hospital, date: targetDate }).populate("patient", "name");

    if (slots.length === 0) {
      if (!doctorDoc.workingHours?.start || !doctorDoc.workingHours?.end) {
        return res.status(400).json({
          success: false,
          message: "Doctor working hours not configured",
        });
      }

      const allSlots = generateSlots(
        doctorDoc.workingHours.start,
        doctorDoc.workingHours.end,
        doctorDoc.slotDuration || 15
      );

      const slotsToCreate = allSlots.map((s) => ({
        doctor,
        hospital,
        date: targetDate,
        slot: s,
        status: "free",
        patient: null,
        appointment: null,
      }));

      try {
        await Slot.insertMany(slotsToCreate, { ordered: false });
      } catch (err) {
        if (err.code !== 11000 && !(err.writeErrors && err.writeErrors.some(e => e.code === 11000))) {
          throw err;
        }
      }

      slots = await Slot.find({ doctor, hospital, date: targetDate }).populate("patient", "name");
    }

    const formattedSlots = slots.map((s) => ({
      slot: s.slot,
      status: s.status,
      patientName: s.patient?.name || null,
      appointmentId: s.appointment || null,
    }));

    return res.json({ success: true, slots: formattedSlots });
  } catch (err) {
    console.error("❌ getDoctorSlots:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
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

    // Validation for booking horizon
    const targetDate = new Date(`${date}T00:00:00.000Z`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const horizonDate = new Date(today);
    horizonDate.setDate(horizonDate.getDate() + 60);

    if (targetDate < today || targetDate > horizonDate) {
      return res.status(400).json({
        message: "Appointments can only be scheduled within the 2-month booking horizon (next 60 days).",
      });
    }

    const doctorDoc = await Doctor.findById(doctor);
    if (!doctorDoc) return res.status(404).json({ message: "Doctor not found." });

    // Clean past empty slots first
    await cleanPastEmptySlots(doctor);

    let slots = await Slot.find({ doctor, hospital, date: targetDate });

    if (slots.length === 0) {
      if (!doctorDoc.workingHours?.start || !doctorDoc.workingHours?.end) {
        return res.status(400).json({ message: "Doctor working hours not configured" });
      }

      const allSlots = generateSlots(
        doctorDoc.workingHours.start,
        doctorDoc.workingHours.end,
        doctorDoc.slotDuration || 15
      );

      const slotsToCreate = allSlots.map((s) => ({
        doctor,
        hospital,
        date: targetDate,
        slot: s,
        status: "free",
        patient: null,
        appointment: null,
      }));

      try {
        await Slot.insertMany(slotsToCreate, { ordered: false });
      } catch (err) {
        if (err.code !== 11000 && !(err.writeErrors && err.writeErrors.some(e => e.code === 11000))) {
          throw err;
        }
      }

      slots = await Slot.find({ doctor, hospital, date: targetDate });
    }

    const freeSlots = slots.filter((s) => s.status === "free").map((s) => s.slot);

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

    if (!patientId || patientId === "null") {
      return res.status(400).json({
        success: false,
        message: "Invalid patientId",
      });
    }

    const appointments = await Appointment.find({
      patient: patientId,
    })
      .populate("doctor")
      .sort({ date: 1 });

    res.json({ success: true, appointments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------------------------------- */
/* Update Appointment Status          */
/* ---------------------------------- */

export const updateAppointmentStatus = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["booked", "cancelled", "completed"].includes(status)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Invalid status." });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true, session }
    );

    if (!appointment) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Appointment not found." });
    }

    // If cancelled, free up the slot document
    if (status === "cancelled") {
      await Slot.findOneAndUpdate(
        { appointment: appointment._id },
        {
          status: "free",
          patient: null,
          appointment: null,
        },
        { session }
      );

      // Clean up patient arrays
      await Patient.findByIdAndUpdate(
        appointment.patient,
        {
          $pull: { bookedAppointments: appointment._id },
          $push: { previousAppointements: appointment._id },
        },
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    res.json({ success: true, appointment });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: err.message });
  }
};

/* ---------------------------------- */
/* Toggle Block Slot                  */
/* ---------------------------------- */
export const toggleBlockSlot = async (req, res) => {
  try {
    const doctorId = req.doctorId; // from protectDoctor middleware
    const { hospital, date, slot } = req.body;

    if (!hospital || !date || !slot) {
      return res.status(400).json({ success: false, message: "Missing parameters" });
    }

    const normalizedDate = new Date(`${date}T00:00:00.000Z`);

    // Find the slot
    let slotDoc = await Slot.findOne({
      doctor: doctorId,
      hospital,
      date: normalizedDate,
      slot
    });

    // If slot doesn't exist, we can lazy generate it
    if (!slotDoc) {
      const doctorDoc = await Doctor.findById(doctorId);
      if (!doctorDoc) {
        return res.status(404).json({ success: false, message: "Doctor not found" });
      }

      const allSlots = generateSlots(
        doctorDoc.workingHours.start,
        doctorDoc.workingHours.end,
        doctorDoc.slotDuration || 15
      );

      if (!allSlots.includes(slot)) {
        return res.status(400).json({ success: false, message: "Invalid slot selected" });
      }

      const slotsToCreate = allSlots.map((s) => ({
        doctor: doctorId,
        hospital,
        date: normalizedDate,
        slot: s,
        status: "free",
        patient: null,
        appointment: null,
      }));

      try {
        await Slot.insertMany(slotsToCreate, { ordered: false });
      } catch (err) {
        if (err.code !== 11000 && !(err.writeErrors && err.writeErrors.some(e => e.code === 11000))) {
          throw err;
        }
      }

      slotDoc = await Slot.findOne({
        doctor: doctorId,
        hospital,
        date: normalizedDate,
        slot
      });
    }

    if (slotDoc.status === "booked") {
      return res.status(400).json({ success: false, message: "Cannot block a booked slot. Please cancel or reschedule the appointment first." });
    }

    // Toggle between free and blocked
    slotDoc.status = slotDoc.status === "blocked" ? "free" : "blocked";
    await slotDoc.save();

    return res.json({ success: true, message: `Slot status updated to ${slotDoc.status}`, slot: slotDoc });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------------------------------- */
/* Reschedule Appointment             */
/* ---------------------------------- */
export const rescheduleAppointment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params; // appointment ID
    const { date, slot } = req.body; // new target date and slot string

    if (!date || !slot) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: "Missing date or slot parameter" });
    }

    const appointment = await Appointment.findById(id).session(session);
    if (!appointment) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (appointment.status !== "booked") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: "Only active booked appointments can be rescheduled" });
    }

    const normalizedNewDate = new Date(`${date}T00:00:00.000Z`);

    // Ensure target slot is not in the past
    const targetSlotStartStr = slot.split("-")[0];
    const [targetSlotHour, targetSlotMin] = targetSlotStartStr.split(":").map(Number);
    const targetSlotDateTime = new Date(normalizedNewDate);
    targetSlotDateTime.setHours(targetSlotHour, targetSlotMin, 0, 0);

    const now = new Date();
    if (targetSlotDateTime < now) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: "Cannot reschedule to a slot in the past" });
    }

    // Check if target slot is already booked or blocked
    let newSlotDoc = await Slot.findOne({
      doctor: appointment.doctor,
      hospital: appointment.hospital,
      date: normalizedNewDate,
      slot
    }).session(session);

    // If new slot doc doesn't exist, we can lazy generate it
    if (!newSlotDoc) {
      const doctorDoc = await Doctor.findById(appointment.doctor).session(session);
      if (!doctorDoc) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ success: false, message: "Doctor not found" });
      }

      const allSlots = generateSlots(
        doctorDoc.workingHours.start,
        doctorDoc.workingHours.end,
        doctorDoc.slotDuration || 15
      );

      if (!allSlots.includes(slot)) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ success: false, message: "Invalid target slot selected" });
      }

      const slotsToCreate = allSlots.map((s) => ({
        doctor: appointment.doctor,
        hospital: appointment.hospital,
        date: normalizedNewDate,
        slot: s,
        status: "free",
        patient: null,
        appointment: null,
      }));

      try {
        await Slot.insertMany(slotsToCreate, { ordered: false, session });
      } catch (err) {
        if (err.code !== 11000 && !(err.writeErrors && err.writeErrors.some(e => e.code === 11000))) {
          throw err;
        }
      }

      newSlotDoc = await Slot.findOne({
        doctor: appointment.doctor,
        hospital: appointment.hospital,
        date: normalizedNewDate,
        slot
      }).session(session);
    }

    if (newSlotDoc.status !== "free") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: "Target slot is not available" });
    }

    // 1. Release old slot
    const oldDateStr = appointment.date.toISOString().split("T")[0];
    const oldNormalizedDate = new Date(`${oldDateStr}T00:00:00.000Z`);

    await Slot.findOneAndUpdate(
      {
        doctor: appointment.doctor,
        hospital: appointment.hospital,
        date: oldNormalizedDate,
        slot: appointment.slot
      },
      {
        status: "free",
        patient: null,
        appointment: null
      },
      { session }
    );

    // 2. Reserve new slot
    newSlotDoc.status = "booked";
    newSlotDoc.patient = appointment.patient;
    newSlotDoc.appointment = appointment._id;
    await newSlotDoc.save({ session });

    // 3. Update appointment date & slot
    appointment.date = new Date(date);
    appointment.slot = slot;
    await appointment.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.json({ success: true, message: "Appointment rescheduled successfully", appointment });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ success: false, message: err.message });
  }
};
