import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Building, MapPin, Phone, Mail, Calendar, Save, ArrowRight, Star, Image as ImageIcon, Check } from "lucide-react";
import "./ConfigureClinic.css";

const PRESET_IMAGES = [
  {
    id: "cozy",
    name: "Cozy Family Clinic",
    url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: "modern",
    name: "Modern Medical Center",
    url: "https://images.unsplash.com/photo-1586773860418-d3b9ad976c6b?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: "specialist",
    name: "Specialist Care Clinic",
    url: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: "pediatric",
    name: "Pediatric Wellness",
    url: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=600",
  }
];

const ConfigureClinic = () => {
  const { hospitalId } = useParams();
  const navigate = useNavigate();
  const doctorId = localStorage.getItem("doctorId");

  const [name, setName] = useState("");
  const [establishedYear, setEstablishedYear] = useState(new Date().getFullYear());
  const [isPrivate, setIsPrivate] = useState(true);
  const [selectedImage, setSelectedImage] = useState(PRESET_IMAGES[0].url);
  const [customImageUrl, setCustomImageUrl] = useState("");
  const [useCustomImage, setUseCustomImage] = useState(false);

  // Address State
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  // Contact State
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [errorMesg, setErrorMesg] = useState("");

  useEffect(() => {
    if (!hospitalId) return;

    const fetchHospitalDetails = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/hospital/getHospital/${hospitalId}`);
        const data = await res.json();
        if (data.success && data.hospital) {
          const h = data.hospital;
          setName(h.name || "");
          if (h.address) {
            setCity(h.address.city || "");
            setStreet(h.address.street || "");
            setState(h.address.state || "");
            setPincode(h.address.pincode || "");
          }
          if (h.contact) {
            setPhone(h.contact.phone || "");
            setEmail(h.contact.email || "");
          }
          if (h.establishedYear) {
            setEstablishedYear(h.establishedYear);
          }
          if (h.isPrivate !== undefined) {
            setIsPrivate(h.isPrivate);
          }
          if (h.image) {
            const isPreset = PRESET_IMAGES.some(p => p.url === h.image);
            if (isPreset) {
              setSelectedImage(h.image);
              setUseCustomImage(false);
            } else {
              setCustomImageUrl(h.image);
              setUseCustomImage(true);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching hospital details:", err);
      } finally {
        setIsFetching(false);
      }
    };

    fetchHospitalDetails();
  }, [hospitalId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMesg("");
    setIsLoading(true);

    const payload = {
      name,
      establishedYear: Number(establishedYear),
      isPrivate,
      image: useCustomImage ? customImageUrl : selectedImage,
      address: {
        street,
        city,
        state,
        pincode
      },
      contact: {
        phone,
        email
      }
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/hospital/update/${hospitalId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(payload),
        credentials: "include"
      });

      const data = await res.json();
      if (data.success) {
        // Successfully set up clinic! Redirect to doctor workspace dashboard.
        navigate(`/doctor/${doctorId}`);
      } else {
        setErrorMesg(data.message || "Failed to update clinic details");
      }
    } catch (err) {
      console.error(err);
      setErrorMesg("Server error while saving clinic settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    navigate(`/doctor/${doctorId}`);
  };

  if (isFetching) {
    return (
      <div className="clinic-config-loading">
        <div className="loader-spinner"></div>
        <p>Loading clinic parameters...</p>
      </div>
    );
  }

  return (
    <div className="clinic-config-page">
      <motion.div 
        className="clinic-config-card glass-panel"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="clinic-config-header">
          <Building className="header-icon" />
          <h1>Configure Your Custom Clinic</h1>
          <p>Provide details to complete your clinic's profile in the CareFlow database.</p>
        </div>

        {errorMesg && (
          <div className="error-alert">
            <span>{errorMesg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="clinic-config-form">
          {/* Main Grid */}
          <div className="form-sections-grid">
            
            {/* Section A: Clinic Basics */}
            <div className="form-section">
              <h2 className="section-title"><Star size={16} /> Basic Credentials</h2>
              
              <div className="form-group">
                <label className="field-label">Clinic / Hospital Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="e.g. Grace Clinical Wellness" 
                  required 
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="field-label">Established Year</label>
                  <input 
                    type="number" 
                    value={establishedYear} 
                    onChange={(e) => setEstablishedYear(e.target.value)} 
                    placeholder="e.g. 2018" 
                    min="1800" 
                    max={new Date().getFullYear()} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="field-label">Clinic Classification</label>
                  <select 
                    value={isPrivate ? "private" : "public"} 
                    onChange={(e) => setIsPrivate(e.target.value === "private")}
                  >
                    <option value="private">Private Practice / Clinic</option>
                    <option value="public">Government / Public Hospital</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section B: Contact Desk */}
            <div className="form-section">
              <h2 className="section-title"><Phone size={16} /> Contact Desk</h2>
              
              <div className="form-group">
                <label className="field-label">Desk Phone Number</label>
                <input 
                  type="tel" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="Desk Contact Number" 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="field-label">Official Email Address</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="contact@yourclinic.com" 
                  required 
                />
              </div>
            </div>

            {/* Section C: Address Details */}
            <div className="form-section span-2">
              <h2 className="section-title"><MapPin size={16} /> Location Address</h2>
              
              <div className="form-group">
                <label className="field-label">Street / Landmark Address</label>
                <input 
                  type="text" 
                  value={street} 
                  onChange={(e) => setStreet(e.target.value)} 
                  placeholder="e.g. 402 Medical Plaza, Sector 15" 
                  required 
                />
              </div>

              <div className="form-row-3">
                <div className="form-group">
                  <label className="field-label">City / Area</label>
                  <input 
                    type="text" 
                    value={city} 
                    onChange={(e) => setCity(e.target.value)} 
                    placeholder="City" 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="field-label">State / Province</label>
                  <input 
                    type="text" 
                    value={state} 
                    onChange={(e) => setState(e.target.value)} 
                    placeholder="State" 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="field-label">Pincode / Zip Code</label>
                  <input 
                    type="text" 
                    value={pincode} 
                    onChange={(e) => setPincode(e.target.value)} 
                    placeholder="Pincode" 
                    required 
                  />
                </div>
              </div>
            </div>

            {/* Section D: Visual Branding */}
            <div className="form-section span-2">
              <h2 className="section-title"><ImageIcon size={16} /> Visual Representation</h2>
              
              <div className="image-choice-toggle">
                <button 
                  type="button" 
                  className={`toggle-tab ${!useCustomImage ? "active" : ""}`}
                  onClick={() => setUseCustomImage(false)}
                >
                  Choose Preset Illustration
                </button>
                <button 
                  type="button" 
                  className={`toggle-tab ${useCustomImage ? "active" : ""}`}
                  onClick={() => setUseCustomImage(true)}
                >
                  Custom URL Link
                </button>
              </div>

              {!useCustomImage ? (
                <div className="preset-grid">
                  {PRESET_IMAGES.map((img) => (
                    <div 
                      key={img.id} 
                      className={`preset-card ${selectedImage === img.url ? "selected" : ""}`}
                      onClick={() => setSelectedImage(img.url)}
                    >
                      <img src={img.url} alt={img.name} />
                      <div className="preset-overlay">
                        <span>{img.name}</span>
                        {selectedImage === img.url && <Check size={16} className="check-icon" />}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="form-group custom-image-input">
                  <label className="field-label">Clinical Photo URL</label>
                  <input 
                    type="url" 
                    value={customImageUrl} 
                    onChange={(e) => setCustomImageUrl(e.target.value)} 
                    placeholder="https://images.unsplash.com/... or other web image" 
                  />
                  {customImageUrl && (
                    <div className="image-preview-box">
                      <img src={customImageUrl} alt="Custom Preview" onError={(e) => e.target.style.display='none'} />
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="skip-btn" 
              onClick={handleSkip}
              disabled={isLoading}
            >
              Skip Setup for Now
            </button>
            <button 
              type="submit" 
              className="save-btn"
              disabled={isLoading}
            >
              {isLoading ? "Saving details..." : <>Save & Go to Home <ArrowRight size={16} /></>}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ConfigureClinic;
