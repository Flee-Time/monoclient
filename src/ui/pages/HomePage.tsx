import { useEffect } from "react";
import "../styles/HomePage.scss";
import { useNavigate } from "react-router-dom";
import { ScaleLoader } from "react-spinners";

function HomePage() {
  const navigate = useNavigate();
  const sessionId = localStorage.getItem("sessionId");

  useEffect(() => {
    if (sessionId && sessionId.length === 64) {
      setTimeout(() => { navigate(`/dashboard`, { replace: true }); }, 1000); // looks cool, so show it to the end user :)
    } else {
      setTimeout(() => { navigate(`/login`, { replace: true }); }, 1000); // Same as above
    }
  });

  return (
    <div className="app-container d-flex justify-content-center align-items-center">
      <div className="card text-center shadow-lg p-4">
        <h1 className="title mb-4">Monolink</h1>
        <div className="loader-container d-flex justify-content-center align-items-center">
          <ScaleLoader color="#1191d8" height={50} width={5} />
        </div>
      </div>
    </div>
  );
}

export default HomePage;
