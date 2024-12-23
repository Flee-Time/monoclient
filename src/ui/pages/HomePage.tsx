import { useEffect, useState } from "react";
import "../styles/pages/HomePage.scss";
import { ProgressBar, Alert, Card, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { ScaleLoader } from "react-spinners";
import variables from "../styles/_variables.module.scss";

function HomePage() {
  const navigate = useNavigate();
  const sessionId = localStorage.getItem("sessionId");

  // States to manage update status and progress
  const [statusMessage, setStatusMessage] = useState("Checking for updates...");
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [updateChecked, setUpdateChecked] = useState(false);

  useEffect(() => {
    window.electron.sendRendererInitialized();

    // Listen for update status messages from the preload script
    const unsubscribeUpdateStatus = window.electron.onUpdateStatus(
      (message) => {
        setStatusMessage(message);
        if (message.startsWith("Error")) {
          console.error(message);
        }
        if (message === "No update available.") {
          setUpdateChecked(true);
        }
      }
    );

    // Listen for download progress messages from the preload script
    const unsubscribeDownloadProgress = window.electron.onDownloadProgress(
      (progressObj) => {
        setDownloadProgress(progressObj.percent);
      }
    );

    // Cleanup listeners when the component unmounts
    return () => {
      unsubscribeUpdateStatus(); // Cleanup the update status listener
      unsubscribeDownloadProgress(); // Cleanup the download progress listener
    };
  }, []);

  // Once update is checked, navigate to dashboard or login
  useEffect(() => {
    if (updateChecked) {
      const redirectTo =
        sessionId && sessionId.length === 64 ? `/dashboard` : `/login`;
      setTimeout(() => {
        navigate(redirectTo, { replace: true });
      }, 1000); // Optional delay to show loader
    }
  }, [updateChecked, sessionId, navigate]);

  return (
    <Container
      fluid
      className="d-flex justify-content-center align-items-center"
    >
      <Card className="text-center shadow-lg p-4" style={{ maxWidth: "400px" }}>
        <Card.Body>
          <h1 className="title mb-4">Lantern</h1>
          <div className="loader-container d-flex justify-content-center align-items-center">
            <ScaleLoader color={variables.loadercolor} height={50} width={5} />
          </div>

          {/* Display the status message */}
          <Alert variant="info" className="mt-4">
            {statusMessage}
          </Alert>

          {/* Display the progress bar if there's download progress */}
          {downloadProgress !== null && (
            <>
              <ProgressBar
                now={downloadProgress}
                label={`${downloadProgress.toFixed(2)}%`}
              />
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}

export default HomePage;
