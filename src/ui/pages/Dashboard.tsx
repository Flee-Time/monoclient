import { Container, Row, Col, Button, Form, InputGroup } from 'react-bootstrap';
import '../styles/Dashboard.scss';

// to be developed, rn just a placeholder

function Dashboard() {
  return (
    <Container fluid className="dashboard-container">
      <Row className="vh-100" style={{paddingTop:35 + 'px'}}>
        {/* Sidebar with User Info and Rooms */}
        <Col md={3} className="sidebar p-4">
          <div className="user-info d-flex align-items-center mb-4">
            <div className="profile-picture rounded-circle me-3"></div>
            <span className="username">Username</span>
          </div>
          <div className="rooms">
            <h5>Rooms</h5>
            <div className="room-list">
              {/* Replace with dynamic room list */}
              <p className="text-muted">Room 1</p>
              <p className="text-muted">Room 2</p>
            </div>
          </div>
        </Col>

        {/* Main Content - Chat Area */}
        <Col md={9} className="chat-area d-flex flex-column p-0">
          <div className="chat-header px-3 py-2">
            <h4 className="room-name">Room Name</h4>
          </div>
          <div className="chat-messages flex-grow-1 p-3">
            <p>hello</p>
            <p>yoo wassup</p>
            {/* Chat messages will go here */}
          </div>
          {/* Message Input at the Bottom */}
          <InputGroup className="message-box p-2">
            <Form.Control
              placeholder="Message Box"
              aria-label="Message Box"
            />
            <Button variant="info">
              <i className="bi bi-arrow-up-circle"></i>
            </Button>
          </InputGroup>
        </Col>
      </Row>
    </Container>
  );
}

export default Dashboard;