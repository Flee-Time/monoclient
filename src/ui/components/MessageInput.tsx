import React, { forwardRef, useState, useLayoutEffect } from "react";
import { InputGroup, Form, Button } from "react-bootstrap";
import { ArrowUp } from "react-bootstrap-icons";
import "../styles/components/MessageInput.scss";

const MAX_LINES = 12; // Maximum number of lines allowed for the input box
const LINE_HEIGHT = 24; // Approximate line height in pixels (Adjust if needed)

interface MessageInputProps {
  messageInput: string;
  setMessageInput: (value: string) => void;
  handleSendMessage: () => void;
}

const MessageInput = forwardRef<HTMLTextAreaElement, MessageInputProps>(
  ({ messageInput, setMessageInput, handleSendMessage }, ref) => {
    const textareaRef = ref as React.RefObject<HTMLTextAreaElement>;
    const [height, setHeight] = useState<string>("auto");

    // Adjust height dynamically
    useLayoutEffect(() => {
      if (textareaRef.current) {
        // Get line height from computed styles
        const computedStyle = window.getComputedStyle(textareaRef.current);
        const lineHeight = parseFloat(computedStyle.lineHeight || "24");

        // Reset height to calculate new scrollHeight correctly
        textareaRef.current.style.height = "auto";
        const scrollHeight = textareaRef.current.scrollHeight;

        // Calculate maxHeight
        const maxHeight = lineHeight * MAX_LINES;

        // Set height to either scrollHeight or maxHeight
        setHeight(`${Math.min(scrollHeight, maxHeight)}px`);
        textareaRef.current.style.height = `${Math.min(
          scrollHeight,
          maxHeight
        )}px`;

        // Toggle scrollbar visibility based on height
        textareaRef.current.style.overflowY =
          scrollHeight > maxHeight ? "auto" : "hidden";
      }
    }, [messageInput]);

    return (
      <InputGroup className="message-box">
        <Form.Control
          as="textarea"
          ref={textareaRef}
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="Type a message..."
          aria-label="Message Box"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          style={{
            height: height,
            maxHeight: `${LINE_HEIGHT * MAX_LINES}px`,
            overflowY: "auto",
            resize: "none",
          }}
        />
        <Button
          variant="info"
          onClick={handleSendMessage}
          style={{
            height: height,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: `${LINE_HEIGHT}px`,
          }}
        >
          <ArrowUp />
        </Button>
      </InputGroup>
    );
  }
);

export default MessageInput;
