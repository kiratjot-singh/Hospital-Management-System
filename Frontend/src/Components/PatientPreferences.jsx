import React, { useState } from "react";
import "./PatientPreferences.css";

const PatientPreferences = () => {
  const [stateValue, setStateValue] = useState("");
  const [district, setDistrict] = useState("");
  const [language, setLanguage] = useState("");

  const states = ["Punjab", "Haryana", "Delhi", "Uttar Pradesh"];

  const districtsByState = {
    Punjab: ["Amritsar", "Ludhiana", "Jalandhar", "Patiala"],
    Haryana: ["Gurugram", "Faridabad", "Panipat", "Hisar"],
    Delhi: ["New Delhi", "South Delhi", "North Delhi"],
    "Uttar Pradesh": ["Noida", "Ghaziabad", "Lucknow", "Kanpur"],
  };

  const languages = [
    "English","Hindi","Punjabi","Marathi","Gujarati","Tamil","Telugu","Kannada",
    "Bengali","Odia","Malayalam","Urdu","Assamese","Manipuri","Bhojpuri",
    "Rajasthani","Haryanvi","Kashmiri","Nepali","Sindhi","Sanskrit"
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
    <div className="pref-page">
      <div className="pref-card">
        <h2 className="title">Patient Preferences</h2>

        <form onSubmit={handleSubmit}>
          <label>State</label>
          <select value={stateValue} onChange={handleStateChange} required>
            <option value="">Select State</option>
            {states.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>

          <label>District / City</label>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            required
            disabled={!stateValue}
          >
            <option value="">
              {stateValue ? "Select District" : "State first"}
            </option>
            {stateValue &&
              districtsByState[stateValue]?.map((dist) => (
                <option key={dist} value={dist}>{dist}</option>
              ))}
          </select>

          <label>Preferred Language</label>
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

          <button className="submit-btn" type="submit" disabled={!isFormValid}>
            Save & Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default PatientPreferences;


