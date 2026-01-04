import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Hospital from "../models/Hospital.js";

async function seedHospitals() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    const hospitals = [
      {
        name: "City Care Hospital",
        image: "https://example.com/images/citycare.jpg",
        address: { city: "Bangalore", state: "Karnataka", pincode: "560001" },
        contact: { phone: "9876543210", email: "info@citycare.com" },
        establishedYear: 2005,
        isPrivate: true
      },
      {
        name: "Green Valley Hospital",
        image: "https://example.com/images/greenvalley.jpg",
        address: { city: "Chandigarh", state: "Punjab", pincode: "160017" },
        contact: { phone: "9123456789", email: "contact@greenvalley.com" },
        establishedYear: 2010,
        isPrivate: false
      },
      {
        name: "Metro Health Center",
        image: "https://example.com/images/metro.jpg",
        address: { city: "Delhi", state: "Delhi", pincode: "110001" },
        contact: { phone: "9988776655", email: "support@metro.com" },
        establishedYear: 1998,
        isPrivate: true
      },
      {
        name: "Sunrise Medical Institute",
        image: "https://example.com/images/sunrise.jpg",
        address: { city: "Jaipur", state: "Rajasthan", pincode: "302001" },
        contact: { phone: "9812345678", email: "info@sunrise.com" },
        establishedYear: 2012,
        isPrivate: true
      },
      {
        name: "Oceanview Hospital",
        image: "https://example.com/images/oceanview.jpg",
        address: { city: "Mumbai", state: "Maharashtra", pincode: "400001" },
        contact: { phone: "9823456789", email: "contact@oceanview.com" },
        establishedYear: 2000,
        isPrivate: false
      },
      {
        name: "Riverdale Hospital",
        image: "https://example.com/images/riverdale.jpg",
        address: { city: "Kolkata", state: "West Bengal", pincode: "700001" },
        contact: { phone: "9834567890", email: "info@riverdale.com" },
        establishedYear: 2008,
        isPrivate: true
      },
      {
        name: "Highland Care Center",
        image: "https://example.com/images/highland.jpg",
        address: { city: "Shimla", state: "Himachal Pradesh", pincode: "171001" },
        contact: { phone: "9845678901", email: "support@highland.com" },
        establishedYear: 2015,
        isPrivate: true
      },
      {
        name: "Silverline Hospital",
        image: "https://example.com/images/silverline.jpg",
        address: { city: "Pune", state: "Maharashtra", pincode: "411001" },
        contact: { phone: "9856789012", email: "info@silverline.com" },
        establishedYear: 2003,
        isPrivate: false
      },
      {
        name: "Evergreen Medical Center",
        image: "https://example.com/images/evergreen.jpg",
        address: { city: "Dehradun", state: "Uttarakhand", pincode: "248001" },
        contact: { phone: "9867890123", email: "contact@evergreen.com" },
        establishedYear: 2018,
        isPrivate: true
      },
      {
        name: "Lotus Heart Hospital",
        image: "https://example.com/images/lotusheart.jpg",
        address: { city: "Hyderabad", state: "Telangana", pincode: "500001" },
        contact: { phone: "9878901234", email: "info@lotusheart.com" },
        establishedYear: 1995,
        isPrivate: true
      }
    ];

    const result = await Hospital.insertMany(hospitals);
    console.log("Hospitals inserted:", result.length);

  } catch (err) {
    console.error("Error seeding hospitals:", err.message);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  }
}

seedHospitals();
