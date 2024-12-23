import React, { useState, useEffect } from "react";
import { Button, Form, Nav } from "react-bootstrap";
import "../styles/components/SettingsScreen.scss";

interface SettingsScreenProps {
  show: boolean;
  onClose: () => void;
  onLogout: () => void;
  userData: {
    username: string;
    profilePicture?: string;
  };
  onSave: (username: string, profilePicture?: File) => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({
  show,
  onClose,
  onLogout,
  userData,
  onSave,
}) => {
  const [selectedMenu, setSelectedMenu] = useState<
    "profile" | "app" | "logout"
  >("profile");
  const [username, setUsername] = useState(userData.username);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
    }
  }, [show]);

  const useEscapeKey = (callback: () => void) => {
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          callback();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }, [callback]);
  };

  const handleClosing = () => {
    setVisible(false)
    setTimeout(() => onClose(), 200);
  }

  const handleSave = () => {
    onSave(username, profilePicture || undefined);
  };

  useEscapeKey(handleClosing);

  if (!show && !visible) return null;

  return (
    <div className={`settings-overlay ${visible ? "show" : ""}`}>
      {/* Sidebar */}
      <div className="settings-sidebar">
        <h5>Settings</h5>
        <Nav className="flex-column">
          <Nav.Link
            active={selectedMenu === "profile"}
            onClick={() => setSelectedMenu("profile")}
          >
            Profile
          </Nav.Link>
          <Nav.Link
            active={selectedMenu === "app"}
            onClick={() => setSelectedMenu("app")}
          >
            App
          </Nav.Link>
        </Nav>
        {/* Logout Button */}
        <div className="logout-button-wrapper">
          <Button
            variant="outline-danger"
            className="w-100"
            onClick={() => setSelectedMenu("logout")}
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="settings-content">
        <button className="settings-close-button" onClick={handleClosing}>
          ✕
        </button>
        {selectedMenu === "profile" && (
          <div>
            <h4>Profile Settings</h4>
            <Form.Group controlId="profilePicture">
              <Form.Label>Profile Picture</Form.Label>
              <div className="d-flex align-items-center gap-3">
                <img
                  src={
                    profilePicture
                      ? URL.createObjectURL(profilePicture)
                      : userData.profilePicture || "/default-avatar.png"
                  }
                  alt="Profile Preview"
                  className="rounded-circle"
                  width="80"
                  height="80"
                />
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const input = e.target as HTMLInputElement;
                    setProfilePicture(input.files?.[0] || null);
                  }}
                />
              </div>
            </Form.Group>
            <Form.Group controlId="username" className="mt-4">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Form.Group>
            <Button variant="primary" onClick={handleSave} className="mt-3">
              Save Changes
            </Button>
          </div>
        )}

        {selectedMenu === "app" && (
          <div>
            <h4>Application Settings</h4>
            <p>These settings are under development.</p>
          </div>
        )}

        {selectedMenu === "logout" && (
          <div>
            <h4>Logout</h4>
            <p>Are you sure you want to log out?</p>
            <Button variant="danger" onClick={onLogout} className="mt-3">
              Confirm Logout
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsScreen;
