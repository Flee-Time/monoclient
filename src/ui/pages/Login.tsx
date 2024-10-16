import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useServer } from "../ServerContext";
import { Form, Button, Card, Container, Modal, Spinner } from "react-bootstrap";

function Login() {
  const navigate = useNavigate();
  const { serverUrl, setServerUrl } = useServer();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleCloseModal = () => setShowModal(false);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Make the login request
      const response = await fetch(`${serverUrl}/login`, {
        method: "POST",
        credentials: "include", // Include cookies
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
    
      if (response.ok) {
        // Check if we received the correct data (success)
        const data = await response.json();
        console.log(data);
        const sessionId = data.sessionId;
    
        if (sessionId && sessionId.length === 64) {
          localStorage.setItem("sessionId", sessionId);
          
          navigate("/dashboard");
        } else {
          setErrorMessage("Invalid session ID received.");
          setShowModal(true);
        }
      } else {
        // Handle error responses
        const errorData = await response.json();
        setErrorMessage(errorData.message || "Login failed. Please try again.");
        setShowModal(true);
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      fluid
      className="app-container d-flex justify-content-center align-items-center"
    >
      <Card className="text-center shadow-lg p-4" style={{ maxWidth: "400px" }}>
        <Card.Body>
          <Card.Title as="h2" className="mb-4 afacad">
            Login
          </Card.Title>

          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3" controlId="serverUrl">
              <Form.Floating>
                <Form.Control
                  type="text"
                  placeholder="Server URL"
                  value={serverUrl}
                  onChange={(e) => setServerUrl(e.target.value)}
                  required
                />
                <label>Server URL</label>
              </Form.Floating>
            </Form.Group>

            <Form.Group className="mb-3" controlId="email">
              <Form.Floating>
                <Form.Control
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <label>Email</label>
              </Form.Floating>
            </Form.Group>

            <Form.Group className="mb-3" controlId="password">
              <Form.Floating>
                <Form.Control
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <label>Password</label>
              </Form.Floating>
            </Form.Group>

            <Button
              type="submit"
              variant="success"
              className="w-100 py-2"
              disabled={loading}
            >
              {loading ? (
                <span>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Logging in...
                </span>
              ) : (
                "Login"
              )}
            </Button>

            <div className="text-center mt-3 lr-text">
              Don't have an account?{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/register", { replace: true });
                }}
              >
                Register here.
              </a>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* Error Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Login Error</Modal.Title>
        </Modal.Header>
        <Modal.Body>{errorMessage}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Login;
