import { Container, Col, Button, Form, InputGroup } from "react-bootstrap";
import "../styles/Dashboard.scss";
import { useNavigate } from "react-router-dom";
import { useServer } from "../ServerContext";
import { useEffect, useState } from "react";
import { ArrowUp } from "react-bootstrap-icons";

interface UserData {
  username: string;
  email: string;
  profilePicture?: string;
}

function Dashboard() {
  const navigate = useNavigate();
  const { serverUrl } = useServer();
  const [userData, setUserData] = useState<UserData>();
  const [registeredUsers, setRegisteredUsers] = useState<UserData[]>([]);
  const [ openRoomName, setOpenRoomName] = useState<string>();

  const handleLogout = () => {
    localStorage.removeItem("sessionId");
    navigate("/");
  };

  const handleRoomChange = (userName:string) => {
    setOpenRoomName(userName);
    // do room changing stuff here for real time chat
  };

  const fetchGetOptions: RequestInit = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("sessionId")}`,
    },
    credentials: "include",
  };

  useEffect(() => {
    // Fetch user data for the current session
    fetch(`${serverUrl}/user/getself`, fetchGetOptions)
      .then((response) => response.json())
      .then((data: UserData) => {
        setUserData(data); // Store data in userData state variable

        // After fetching the user data, fetch all registered users
        fetch(`${serverUrl}/user/getregistered`, fetchGetOptions)
          .then((response) => response.json())
          .then((allUsers: UserData[]) => {
            // Filter out the current user based on their email
            const filteredUsers = allUsers.filter(
              (user) => user.email !== data.email
            );
            setRegisteredUsers(filteredUsers); // Store filtered list in registeredUsers state variable
          })
          .catch((error) => {
            console.error("Error fetching all registered user data:", error);
          });
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  }, []);

  return (
    <Container fluid className="dashboard-container vh-100 d-flex">
      {/* Sidebar with User Info and Rooms */}
      <Col md={3} className="sidebar d-flex flex-column p-4">
        {/* User Info */}
        {userData && (
          <div className="user-info d-flex align-items-center mb-4">
            <div className="profile-picture rounded-circle me-3">
              {userData.profilePicture && (
                <img
                  src={`data:image/jpeg;base64,${userData.profilePicture}`}
                  alt="Profile"
                  className="profile-image"
                />
              )}
            </div>
            <span className="username">{userData.username}</span>
          </div>
        )}

        {/* Room List */}
        <div className="rooms flex-grow-1">
          <h5 className="text-muted">People</h5>
          <div className="room-list">
            {registeredUsers.map((user, index) => (
              <div key={index} className="room d-flex align-items-center mb-3" onClick={() => handleRoomChange(user.username)}>
                {user.profilePicture && (
                  <img
                    src={`data:image/jpeg;base64,${user.profilePicture}`}
                    alt={`${user.username} Profile`}
                    className="room-profile-picture me-3"
                  />
                )}
                <span className="room-username">{user.username}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Logout Button */}
        <Button
          variant="outline-danger"
          className="mt-auto logout-button align-self-start"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Col>

      {/* Main Content - Chat Area */}
      <Col md={9} className="chat-area d-flex flex-column p-0">
        <div className="chat-header px-3 py-2 border-bottom">
          <h4 className="room-name">{openRoomName ? openRoomName : "No Room Selected" }</h4>
        </div>
        <div className="chat-messages flex-grow-1 p-3">
          {/* Chat messages will go here */}
          <p>placeholder</p>
          <p>no actual real time chat has been coded</p>
        </div>
        {/* Message Input at the Bottom */}
        <InputGroup className="message-box p-3">
          <Form.Control placeholder="Message Box" aria-label="Message Box" />
          <Button variant="info">
            <ArrowUp />
          </Button>
        </InputGroup>
      </Col>
    </Container>
  );
}

export default Dashboard;
