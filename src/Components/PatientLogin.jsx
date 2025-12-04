// import React, { useState } from "react";
// import "./PatientLogin.css";

// const PatientLogin = () => {
//   const [phone, setPhone] = useState("");
//   const [otp, setOtp] = useState("");
//   const [step, setStep] = useState("phone"); // "phone" ya "otp"

//   const handleSendOtp = (e) => {
//     e.preventDefault();
//     // yaha tusi backend/API call kr sakde ho OTP send karan layi
//     console.log("Send OTP to:", phone);
//     setStep("otp");
//   };

//   const handleVerifyOtp = (e) => {
//     e.preventDefault();
//     // yaha tusi OTP verify karan da code/API call lgaoge
//     console.log("Verify OTP:", otp, "for phone:", phone);
//     alert("Login successful (UI only demo)!");
//   };

//   const isPhoneValid = phone.trim().length === 10; // simple check

//   return (
//     <div className="login-page">
//       <div className="login-card">
//         <div className="login-left">
//           <h1 className="app-title">Hospital Management System</h1>
//           <p className="app-subtitle">
//             Patient portal – book appointments, view reports and manage your
//             visits easily.
//           </p>
//         </div>

//         <div className="login-right">
//           <h2 className="login-title">Patient Login</h2>
//           <p className="login-caption">
//             Enter your registered mobile number to receive an OTP.
//           </p>

//           {step === "phone" && (
//             <form className="login-form" onSubmit={handleSendOtp}>
//               <label className="input-label" htmlFor="phone">
//                 Mobile Number
//               </label>
//               <div className="input-group">
//                 <span className="country-code">+91</span>
//                 <input
//                   id="phone"
//                   type="tel"
//                   maxLength={10}
//                   placeholder="Enter 10-digit mobile number"
//                   value={phone}
//                   onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
//                   required
//                 />
//               </div>

//               <button
//                 type="submit"
//                 className="primary-btn"
//                 disabled={!isPhoneValid}
//               >
//                 Send OTP
//               </button>
//             </form>
//           )}

//           {step === "otp" && (
//             <form className="login-form" onSubmit={handleVerifyOtp}>
//               <div className="info-box">
//                 OTP has been sent to <strong>+91-{phone}</strong>
//               </div>

//               <label className="input-label" htmlFor="otp">
//                 Enter OTP
//               </label>
//               <input
//                 id="otp"
//                 type="text"
//                 maxLength={6}
//                 placeholder="6-digit OTP"
//                 value={otp}
//                 onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
//                 required
//               />

//               <button type="submit" className="primary-btn">
//                 Verify & Login
//               </button>

//               <button
//                 type="button"
//                 className="link-btn"
//                 onClick={() => setStep("phone")}
//               >
//                 Change mobile number
//               </button>
//             </form>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PatientLogin;
import React, { useState } from "react";
import "./PatientLogin.css";

const PatientLogin = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState("phone"); // "phone" ya "otp"
  const [mode, setMode] = useState("otp");   // "otp" ya "password"

  const isPhoneValid = phone.trim().length === 10;

  // ----- OTP FLOW -----
  const handleSendOtp = (e) => {
    e.preventDefault();
    console.log("Send OTP to:", phone);
    setStep("otp");
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    console.log("Verify OTP:", otp, "for phone:", phone);
    alert("Login successful with OTP (UI demo)");
  };

  // ----- PASSWORD LOGIN -----
  const handlePasswordLogin = (e) => {
    e.preventDefault();
    console.log("Login with password:", { phone, password });
    alert("Login successful with password (UI demo)");
  };

  const switchToOtp = () => {
    setMode("otp");
    setStep("phone");
    setOtp("");
    setPassword("");
  };

  const switchToPassword = () => {
    setMode("password");
    setStep("phone");
    setOtp("");
    setPassword("");
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* LEFT SIDE */}
        <div className="login-left">
          <h1 className="app-title">Hospital Management System</h1>
          <p className="app-subtitle">
            Patient portal – book appointments, view reports and manage your
            visits easily.
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="login-right">
          <h2 className="login-title">Patient Login</h2>
          <p className="login-caption">
            Choose how you want to login to your patient account.
          </p>

          {/* TOGGLE: OTP / PASSWORD */}
          <div className="toggle-container">
            <button
              type="button"
              className={`toggle-btn ${mode === "otp" ? "active" : ""}`}
              onClick={switchToOtp}
            >
              Login with OTP
            </button>
            <button
              type="button"
              className={`toggle-btn ${mode === "password" ? "active" : ""}`}
              onClick={switchToPassword}
            >
              Login with Password
            </button>
          </div>

          {/* --------- LOGIN WITH OTP --------- */}
          {mode === "otp" && step === "phone" && (
            <form className="login-form" onSubmit={handleSendOtp}>
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
                  required
                />
              </div>

              <button
                type="submit"
                className="primary-btn"
                disabled={!isPhoneValid}
              >
                Send OTP
              </button>
            </form>
          )}

          {mode === "otp" && step === "otp" && (
            <form className="login-form" onSubmit={handleVerifyOtp}>
              <div className="info-box">
                OTP has been sent to <strong>+91-{phone}</strong>
              </div>

              <label className="input-label" htmlFor="otp">
                Enter OTP
              </label>
              <input
                id="otp"
                type="text"
                maxLength={6}
                placeholder="6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                required
              />

              <button type="submit" className="primary-btn">
                Verify & Login
              </button>

              <button
                type="button"
                className="link-btn"
                onClick={() => setStep("phone")}
              >
                Change mobile number
              </button>
            </form>
          )}

          {/* --------- LOGIN WITH PASSWORD --------- */}
          {mode === "password" && (
            <form className="login-form" onSubmit={handlePasswordLogin}>
              <label className="input-label" htmlFor="phonePwd">
                Mobile Number
              </label>
              <div className="input-group">
                <span className="country-code">+91</span>
                <input
                  id="phonePwd"
                  type="tel"
                  maxLength={10}
                  placeholder="Enter 10-digit mobile number"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/\D/g, ""))
                  }
                  required
                />
              </div>

              <label className="input-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                type="submit"
                className="primary-btn"
                disabled={!isPhoneValid || !password}
              >
                Login
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientLogin;


