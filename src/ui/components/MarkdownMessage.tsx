import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import DOMPurify from "dompurify";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import '../styles/components/MarkdownMessage.scss'

interface MarkdownMessageProps {
  message: string;
}

interface AnchorProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children?: React.ReactNode;
}

interface CodeProps {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const MarkdownMessage: React.FC<MarkdownMessageProps> = React.memo(
  ({ message }) => {
    const sanitizedMessage = DOMPurify.sanitize(message);

    const handleLinkClick = (
      event: React.MouseEvent<HTMLAnchorElement>,
      href?: string
    ) => {
      event.preventDefault();
      if (href) {
        window.electron.openExternal(href);
      }
    };

    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Handle Inline and Block Code Separately
          code({ inline, className, children, ...props }: CodeProps) {
            const match = /language-(\w+)/.exec(className || "");

            if (inline) {
              // Inline Code
              return <code {...props}>{children}</code>;
            }

            if (match) {
              // Syntax Highlighted Code Block
              return (
                <SyntaxHighlighter
                  style={materialDark}
                  language={match[1]}
                  PreTag="div"
                  {...props}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              );
            }

            // Plain Code Block (No Syntax Highlighting)
            return (
              <pre
                {...props}
                style={{
                  display: "inline",
                }}
              >
                <code>{children}</code>
              </pre>
            );
          },

          // Handle Links
          a({ href, children, ...props }: AnchorProps) {
            return (
              <a
                href={href}
                onClick={(e) => handleLinkClick(e, href)}
                {...props}
              >
                {children}
              </a>
            );
          },

          // Handle Paragraphs
          p({ children }) {
            return <p>{children}</p>;
          },
        }}
      >
        {sanitizedMessage}
      </ReactMarkdown>
    );
  }
);

export default MarkdownMessage;
