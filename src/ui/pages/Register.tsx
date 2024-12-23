import { useState, ChangeEvent, FormEvent, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useServer } from "../ServerContext";
import Cropper from "react-easy-crop";
import getCroppedImg from "../util";
import "../styles/pages/Register.scss";
import {
  Form,
  Button,
  Card,
  Container,
  Row,
  Col,
  Modal,
  Spinner,
} from "react-bootstrap";

function Register() {
  const navigate = useNavigate();
  const { serverUrl, setServerUrl } = useServer();
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);

  const [modalMessage, setModalMessage] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropModal, setShowCropModal] = useState<boolean>(false);

  const handleProfilePictureChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file)); // Set preview of the selected image
      setShowCropModal(true); // Show the cropping modal when a file is selected

      // Reset the input value so that selecting the same file triggers the change event again
      e.target.value = ""; // Reset input value to allow re-selecting the same file
    }
  };

  const onCropComplete = useCallback(
    (_: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  // Handle the cropping when 'Done' is clicked
  const handleCrop = async () => {
    if (profilePicture && croppedAreaPixels && previewUrl) {
      // Crop the image and generate a new Blob
      const croppedBlobUrl = await getCroppedImg(previewUrl, croppedAreaPixels);

      // Generate a URL for the cropped image and display it
      const croppedImageUrl = URL.createObjectURL(croppedBlobUrl);
      setCroppedImage(croppedImageUrl); // Set the URL of the cropped image
      setShowCropModal(false); // Hide the modal
    }
  };

  // Handle the 'Cancel' action in the crop modal
  const handleCancelCrop = () => {
    setShowCropModal(false); // Hide the modal without cropping
    setProfilePicture(null); // Remove selected profile picture
    setPreviewUrl(null);
    setCroppedImage(null);
  };

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      setModalMessage("Passwords do not match!");
      setShowModal(true);
      setLoading(false);
      return;
    }

    if (!croppedImage) {
      setModalMessage("Please upload and crop a profile picture.");
      setShowModal(true);
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);
    formData.append("password", password);

    if (croppedImage) {
      const response = await fetch(croppedImage);
      const blob = await response.blob();
      const file = new File([blob], "profile.jpg", { type: "image/jpeg" });
      formData.append("profilePicture", file);
    }

    try {
      const response = await fetch(`${serverUrl}/register`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setModalMessage("Registration successful!");
        setIsSuccess(true);
      } else {
        const errorData = await response.json();
        setModalMessage(
          errorData.message || "Registration failed. Please try again."
        );
      }
      setShowModal(true);
    } catch (error) {
      console.error("Registration error:", error);
      setModalMessage("An unexpected error occurred. Please try again.");
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    if (isSuccess) {
      navigate("/login");
    }
  };

  return (
    <Container
      fluid
      className="d-flex justify-content-center align-items-center"
    >
      <Card className="text-center shadow-lg p-4" style={{ maxWidth: "650px" }}>
        <Card.Body>
          <Card.Title as="h2" className="mb-4 afacad">
            Register
          </Card.Title>

          <Form onSubmit={handleRegister}>
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

            <div className="profile-picture-container mb-3">
              {croppedImage ? (
                <img
                  src={croppedImage}
                  alt="Cropped Profile"
                  className="profile-preview"
                />
              ) : previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Profile Preview"
                  className="profile-preview"
                />
              ) : (
                <div className="profile-placeholder">
                  Upload Profile Picture
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className="profile-input"
                onChange={handleProfilePictureChange}
                required={!croppedImage}
              />
            </div>

            {/* Crop Modal */}
            <Modal show={showCropModal} onHide={handleCancelCrop} centered>
              <Modal.Header closeButton>
                <Modal.Title>Crop your profile picture</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "400px", // Set the height to a larger value
                  }}
                >
                  {previewUrl && (
                    <Cropper
                      image={previewUrl}
                      crop={crop}
                      zoom={zoom}
                      aspect={1} // Aspect ratio of 1:1 for profile pictures
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onCropComplete={onCropComplete}
                    />
                  )}
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleCancelCrop}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleCrop}>
                  Done
                </Button>
              </Modal.Footer>
            </Modal>

            <Row className="g-3">
              <Col md={6}>
                <Form.Group controlId="username">
                  <Form.Floating>
                    <Form.Control
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                    <label>Username</label>
                  </Form.Floating>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="email">
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
              </Col>

              <Col md={6}>
                <Form.Group controlId="password">
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
              </Col>

              <Col md={6}>
                <Form.Group controlId="confirmPassword">
                  <Form.Floating>
                    <Form.Control
                      type="password"
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <label>Confirm Password</label>
                  </Form.Floating>
                </Form.Group>
              </Col>
            </Row>

            <Button
              type="submit"
              variant="success"
              className="w-100 py-2 mt-4"
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
                  Registering...
                </span>
              ) : (
                "Register"
              )}
            </Button>

            <div className="text-center mt-3 lr-text">
              Already have an account?{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/login", { replace: true });
                }}
              >
                Click here for the login page.
              </a>
            </div>
          </Form>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Registration Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>{modalMessage}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Register;
