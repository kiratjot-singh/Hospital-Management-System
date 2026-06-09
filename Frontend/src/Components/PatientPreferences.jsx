import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Settings, Sliders, MapPin, Languages, ArrowLeft, Heart, CheckCircle2 } from "lucide-react";
import Navbar from "./Navbar";
import "./PatientPreferences.css";

const PatientPreferences = () => {
  const [stateValue, setStateValue] = useState("");
  const [district, setDistrict] = useState("");
  const [language, setLanguage] = useState("");
  const navigate = useNavigate();

  const states = ["Punjab", "Haryana", "Delhi", "Uttar Pradesh"];

  const districtsByState = {
    Punjab: ["Amritsar", "Ludhiana", "Jalandhar", "Patiala"],
    Haryana: ["Gurugram", "Faridabad", "Panipat", "Hisar"],
    Delhi: ["New Delhi", "South Delhi", "North Delhi"],
    "Uttar Pradesh": ["Noida", "Ghaziabad", "Lucknow", "Kanpur"],
  };

  const languages = [
    "English", "Hindi", "Punjabi", "Marathi", "Gujarati", "Tamil", "Telugu", "Kannada",
    "Bengali", "Odia", "Malayalam", "Urdu", "Assamese", "Manipuri", "Bhojpuri",
    "Rajasthani", "Haryanvi", "Kashmiri", "Nepali", "Sindhi", "Sanskrit"
  ];

  const handleStateChange = (e) => {
    const val = e.target.value;
    setStateValue(val);
    setDistrict("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Saved:", { stateValue, district, language });
    alert("Preferences Saved!");
  };

  const isFormValid = stateValue && district && language;

  return (
    <div className="pref-layout">
      <Navbar role="patient" phone="" />

      <div className="pref-container">
        <button className="back-btn-float" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Back
        </button>

        <motion.div 
          className="pref-form-card glass-panel"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="pref-card-header">
            <Sliders className="pref-header-icon" />
            <div>
              <h2>Localization Preferences</h2>
              <p>Configure your state, district, and spoken language preferences for personalized recommendations.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="pref-form-fields">
            <div className="form-group">
              <label className="input-label">State / Province</label>
              <div className="input-group no-prefix">
                <select value={stateValue} onChange={handleStateChange} required>
                  <option value="">Select State</option>
                  {states.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
                <MapPin size={18} className="input-icon" />
              </div>
            </div>

            <div className="form-group">
              <label className="input-label">District / City</label>
              <div className="input-group no-prefix">
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  required
                  disabled={!stateValue}
                >
                  <option value="">
                    {stateValue ? "Select District" : "Select State First"}
                  </option>
                  {stateValue &&
                    districtsByState[stateValue]?.map((dist) => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
                </select>
                <MapPin size={18} className="input-icon" />
              </div>
            </div>

            <div className="form-group">
              <label className="input-label">Preferred Communication Language</label>
              <div className="input-group no-prefix">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  required
                >
                  <option value="">Select Language</option>
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
                <Languages size={18} className="input-icon" />
              </div>
            </div>

            <button className="primary-btn submit-pref-btn" type="submit" disabled={!isFormValid}>
              <CheckCircle2 size={18} /> Save & Apply Localization
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default PatientPreferences;
