import React, { useState } from "react";
import { useNavigate,Links, Link } from "react-router-dom";
import axios from "axios"
import "./PatientLogin.css";

const PatientSignup = () => {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [mesg, setMesg] = useState("");

const navigate=useNavigate();
  const isPhoneValid = /^\d{10}$/.test(phone);

  const handleSubmit = async (e) => {
  e.preventDefault();

  setMesg("");

  if (password !== confirmPwd) {
    setError("Password and Confirm Password do not match");
    return;
  }

  try {
   const res=await axios.post("http://127.0.0.1:5000/api/signup",{
     name: fullName,
  phonenumber: phone,
  password: password,
   });
   if(res.data.success){
      setMesg(res.data.message)
    navigate("/");
   }else{
    setMesg(res.data.message)
   }
  } catch (err) {
  const msg =
    err.response?.data?.message ||
    "Something went wrong. Please try again.";
    console.log(err);
  setMesg(msg);
}
};


 const isFormValid =
  fullName.trim().length > 0 &&
  isPhoneValid === true &&
  password.trim().length > 0 &&
  confirmPwd.trim().length > 0 


  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-left">
          <h1 className="app-title">Hospital Management System</h1>
          <p className="app-subtitle">
            Create your patient account to book appointments and manage your
            visits easily.
          </p>
        </div>
        <div className="login-right">
          <h2 className="login-title">Patient Signup</h2>
          <p className="login-caption">
            Fill the details below to create your account.
          </p>

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="input-label" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <label className="input-label" htmlFor="phone">
              Mobile Number
            </label>
            <div className="input-group">
              <span className="country-code">+91</span>
              <input
                id="phone"
                type="tel"
                maxLength={10}
                placeholder="Enter 10-digit mobile number"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/\D/g, ""))
                }
              />
            </div>

            <label className="input-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Create password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <label className="input-label" htmlFor="confirmPwd">
              Confirm Password
            </label>
            <input
              id="confirmPwd"
              type="password"
              placeholder="Re-enter password"
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              required
            />

              {mesg && <p className="error-text">{mesg}</p>}

            <button
              type="submit"
              className="primary-btn"
              disabled={!isFormValid}
            >
              Create Account
            </button>

            <p className="helper-text">
              Already registered?{" "}
             <Link className="helper-link" to="/">Login</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PatientSignup;
