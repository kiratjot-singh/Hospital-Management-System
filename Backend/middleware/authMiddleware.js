import jwt from "jsonwebtoken";

const getToken = (req) => {
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  if (req.headers && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    return req.headers.authorization.split(" ")[1];
  }
  return null;
};

export const protectPatient = (req, res, next) => {
  const token = getToken(req);

  if (!token) {
    return res.status(401).json({ success: false, message: "Not logged in" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
    // Compatibility check: if role is present, ensure it is 'patient'
    if (decoded.role && decoded.role !== "patient") {
      return res.status(403).json({ success: false, message: "Access denied. Patient role required." });
    }
    req.patientId = decoded.id; // Attach patient ID
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

export const protectDoctor = (req, res, next) => {
  const token = getToken(req);

  if (!token) {
    return res.status(401).json({ success: false, message: "Not logged in" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
    if (decoded.role && decoded.role !== "doctor") {
      return res.status(403).json({ success: false, message: "Access denied. Doctor role required." });
    }
    req.doctorId = decoded.id; // Attach doctor ID
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

export const protectUser = (req, res, next) => {
  const token = getToken(req);

  if (!token) {
    return res.status(401).json({ success: false, message: "Not logged in" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};
