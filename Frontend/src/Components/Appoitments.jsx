import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./Appointments.css";

const Appointments = () => {
 const { patientId } = useParams(); // URL ton aaya
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/appointments/patient/${patientId}`,{
  credentials: "include",
});
        const data = await res.json();

        if (data.success) {
          setAppointments(data.appointments);
        }
      } catch (err) {
        console.error("Error fetching appointments", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [patientId]);

  if (loading) {
    return <h2 className="loading">Loading appointments...</h2>;
  }

  return (
    <div className="container">
      <h1>My Booked Appointments</h1>

      {appointments.length === 0 ? (
        <p>No appointments found</p>
      ) : (
        appointments.map((app) => (
          <div className="card" key={app._id}>
            <h3>Dr. {app.doctor.name}</h3>
            <p><b>Specialization:</b> {app.doctor.specialization}</p>
            <p><b>Date:</b> {new Date(app.date).toLocaleDateString()}</p>
            <p><b>Time:</b> {app.slot}</p>
            <span className={`status ${app.status}`}>
              {app.status}
            </span>
          </div>
        ))
      )}
    </div>
  );
};

export default Appointments;
