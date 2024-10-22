import { Container, Col, Button, Form, InputGroup } from "react-bootstrap";
import "../styles/Dashboard.scss";
import { useNavigate } from "react-router-dom";
import { useServer } from "../ServerContext";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { ArrowUp } from "react-bootstrap-icons";

interface UserData {
  id: string;
  username: string;
  email: string;
  profilePicture?: string;
}

interface Message {
  originUserID: string;
  destinationUserID: string;
  message: string;
  timestamp: string;
}

function Dashboard() {
  const navigate = useNavigate();
  const { serverUrl } = useServer();
  const [userData, setUserData] = useState<UserData>();
  const [registeredUsers, setRegisteredUsers] = useState<UserData[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [openRoomName, setOpenRoomName] = useState<string>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState<string>("");

  const messageEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);
  const registeredUsersRef = useRef<UserData[]>([]);
  const openRoomNameRef = useRef<string>();
  const userDataRef = useRef<UserData>();

  // Whenever registeredUsers state changes, update the ref
  useEffect(() => {
    registeredUsersRef.current = registeredUsers;
  }, [registeredUsers]);

  useEffect(() => {
    openRoomNameRef.current = openRoomName;
  }, [openRoomName]);

  useEffect(() => {
    userDataRef.current = userData;
  }, [userData]);
  

  useEffect(() => {
    const socket = io(serverUrl, {
      withCredentials: true,
      auth: {
        token: localStorage.getItem("sessionId"),
      },
    });

    socketRef.current = socket;

    // Handle user info and registered users
    socket.on("userInfo", (data) => {
      setUserData(data);
    });

    socket.on("registeredUsers", (users) => {
      setRegisteredUsers(users);
    });

    socket.on("onlineUsers", (users) => {
      setOnlineUsers(users);
    });

    socket.on("userOnline", () => {
      socket.emit("getAllRegisteredUsers");
      socket.emit("getOnlineUsers");
    });

    socket.on("userOffline", () => {
      socket.emit("getOnlineUsers");
    });

    // Receive new messages
    socket.on("newMessage", (message: Message) => {
      // Decode the base64 message before adding it to the state
      const decodedMessage = {
        ...message,
        message: decodeBase64Message(message.message), // Decode the message content
      };

      // Find the user who sent the message
      const sender = registeredUsersRef.current.find(
        (user) => user.id === decodedMessage.originUserID
      );

      const isSameRoom = sender?.username !== openRoomNameRef.current;

      if (window.electron && decodedMessage.originUserID === userDataRef.current?.id) {
        // Send the notification through Electron
        window.electron.sendNotification({
          title: sender?.username || "Unknown", // Fallback to "Unknown" if username is undefined
          body: decodedMessage.message, // The decoded message content
          icon: sender?.profilePicture
            ? `data:image/jpeg;base64,${sender.profilePicture}`
            : "fallback", // Fallback to a valid default image
          sameRoom: isSameRoom,
        });
      }

      // Check if the message is from the currently open room
      if (isSameRoom || sender?.id === userDataRef.current?.id) {
        // Append the message to the current room's messages
        setMessages((prevMessages) => [...prevMessages, decodedMessage]);
      }
    });

    // Load chat history
    socket.on("chatHistory", (chatHistory: Message[]) => {
      // Decode each message in the chat history before updating the state
      const decodedHistory = chatHistory.map((msg) => ({
        ...msg,
        message: decodeBase64Message(msg.message), // Decode each message content
      }));

      setMessages(decodedHistory);
    });

    // Emit events to get initial data
    socket.emit("getUserInfo");
    socket.emit("getAllRegisteredUsers");
    socket.emit("getOnlineUsers");

    return () => {
      socket.disconnect();
    };
  }, [serverUrl]);

  const handleLogout = () => {
    localStorage.removeItem("sessionId");
    navigate("/");
  };

  const handleRoomChange = (username: string) => {
    setOpenRoomName(username);
    setMessages([]); // Clear previous messages when room changes

    // Emit event to load chat history
    if (socketRef.current && userData) {
      socketRef.current.emit("loadHistory", {
        destinationUsername: username,
      });
    }
  };

  const handleSendMessage = () => {
    if (messageInput.trim() && openRoomName && userData) {
      // Emit event to send message
      socketRef.current.emit("sendMessage", {
        username: userData.username,
        destinationUsername: openRoomName,
        message: messageInput,
      });

      // Clear the message input
      setMessageInput("");
    }
  };

  // Scroll to bottom whenever the messages array is updated
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Utility function to decode base64 messages
  function decodeBase64Message(message: string): string {
    return decodeURIComponent(
      atob(message)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
  }

  // Helper function to scroll to the bottom of the chat
  const scrollToBottom = () => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Helper function to check if a user is online
  const isUserOnline = (userID: string): boolean => {
    return onlineUsers.some((onlineUser) => onlineUser === userID);
  };

  // Helper function to check if two messages are sent within 5 minutes
  const isWithinOneMinute = (
    previousTimestamp: string,
    currentTimestamp: string
  ): boolean => {
    const prevTime = new Date(previousTimestamp);
    const currTime = new Date(currentTimestamp);
    return (currTime.getTime() - prevTime.getTime()) / 1000 / 60 < 1;
  };

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
            {registeredUsers
              .filter((user) => user.id !== userData?.id) // Skip current user
              .map((user, index) => (
                <div
                  key={index}
                  className="room d-flex align-items-center mb-3"
                  onClick={() => handleRoomChange(user.username)}
                >
                  {user.profilePicture && (
                    <img
                      src={`data:image/jpeg;base64,${user.profilePicture}`}
                      alt={`${user.username} Profile`}
                      className={`room-profile-picture me-3 ${
                        isUserOnline(user.id) ? "online-user" : ""
                      }`} // Apply class conditionally if the user is online
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
          <h4 className="room-name">
            {openRoomName ? openRoomName : "No Room Selected"}
          </h4>
        </div>
        <div className="chat-messages flex-grow-1 p-3">
          {messages.length > 0 ? (
            messages.map((message, index) => {
              const previousMessage = messages[index - 1];
              const showAvatarAndUsername =
                !previousMessage ||
                previousMessage.originUserID !== message.originUserID ||
                !isWithinOneMinute(
                  previousMessage.timestamp,
                  message.timestamp
                );

              return (
                <div key={index} className="chat-message-group">
                  {showAvatarAndUsername && (
                    <div className="message-header d-flex align-items-center">
                      <div className="message-avatar me-3">
                        <img
                          src={
                            registeredUsers.find(
                              (user) => user.id === message.originUserID
                            )?.profilePicture
                              ? `data:image/jpeg;base64,${
                                  registeredUsers.find(
                                    (user) => user.id === message.originUserID
                                  )?.profilePicture
                                }`
                              : "/path/to/default/avatar.png" // Fallback avatar
                          }
                          alt="User Avatar"
                          className="message-avatar-img"
                        />
                      </div>
                      <div className="message-content">
                        <strong className="chat-username">
                          {registeredUsers.find(
                            (user) => user.id === message.originUserID
                          )?.username || "Unknown"}
                        </strong>
                        <span className="chat-timestamp">
                          {new Date(message.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className={`chat-message-wrapper`}>
                    <div className="chat-message-text">{message.message}</div>
                  </div>
                </div>
              );
            })
          ) : (
            <p>No messages yet.</p>
          )}
          <div ref={messageEndRef}></div> {/* Scroll anchor */}
        </div>
        {/* Message Input at the Bottom */}
        <InputGroup className="message-box p-3">
          <Form.Control
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type a message..."
            aria-label="Message Box"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSendMessage();
              }
            }}
          />
          <Button variant="info" onClick={handleSendMessage}>
            <ArrowUp />
          </Button>
        </InputGroup>
      </Col>
    </Container>
  );
}

export default Dashboard;
