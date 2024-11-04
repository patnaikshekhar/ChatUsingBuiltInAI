import React, { useState, useEffect, useRef } from 'react';
import { AISession, getSession } from './session';
import ReactMarkdown from 'react-markdown';

interface ChatMessage {
    content: string;
    sender: string;
    timestamp: string;
}

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [session, setSession] = useState<AISession | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]); // Scroll whenever messages update

  useEffect(() => {
    async function initializeSession() {
      const aiSession = await getSession();
      setSession(aiSession);
    }
    initializeSession();
  }, []);

  // GitLab colors
  const colors = {
    red: '#E24329',
    orange: '#FC6D26',
    yellow: '#FCA326',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    if (!session) {
        console.error('AI session is not initialized.');
        return;
    }

    const newMessage = {
      content: inputMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    const msgs = [...messages, newMessage]
    setMessages(msgs);
    setInputMessage('');

    const stream = await session.promptStreaming(inputMessage);
    
    for await (const chunk of stream) {
        setMessages([...msgs, {
            content: chunk,
            sender: 'ai',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
    }
  };

  // Markdown styles
  const markdownStyles = {
    h1: 'text-2xl font-bold mb-4 mt-2',
    h2: 'text-xl font-bold mb-3 mt-2',
    h3: 'text-lg font-bold mb-2 mt-2',
    p: 'mb-2',
    ul: 'list-disc ml-4 mb-2',
    ol: 'list-decimal ml-4 mb-2',
    li: 'mb-1',
    code: 'bg-gray-100 rounded px-1 py-0.5 font-mono text-sm',
    pre: 'bg-gray-100 rounded p-2 mb-2 overflow-x-auto',
    blockquote: 'border-l-4 border-gray-200 pl-4 italic my-2',
    a: 'text-blue-600 hover:underline',
    strong: 'font-bold',
    em: 'italic'
  };

  // Avatar components with fixed dimensions
  const UserAvatar = () => (
    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
      <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
      </svg>
    </div>
  );

  const AIAvatar = () => (
    <div 
      className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
      style={{ backgroundColor: colors.red }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 380 380"
        className="w-6 h-6"
      >
        <path
          fill="white"
          d="M282.83,170.73l-.27-.69-26.14-68.22a6.81,6.81,0,0,0-2.69-3.24,7,7,0,0,0-8,.43,7,7,0,0,0-2.32,3.52l-17.65,54H154.29l-17.65-54A6.86,6.86,0,0,0,134.32,99a7,7,0,0,0-8-.43,6.87,6.87,0,0,0-2.69,3.24L97.44,170l-.26.69a48.54,48.54,0,0,0,16.1,56.1l.09.07.24.17,39.82,29.82,19.7,14.91,12,9.06a8.07,8.07,0,0,0,9.76,0l12-9.06,19.7-14.91,40.06-30,.1-.08A48.56,48.56,0,0,0,282.83,170.73Z"
        />
      </svg>
    </div>
  );

  // Custom component for markdown code blocks
  const CodeBlock = ({ children, className }) => {
    const language = className ? className.replace('language-', '') : '';
    return (
      <pre className={markdownStyles.pre}>
        <code className={`${markdownStyles.code} language-${language}`}>
          {children}
        </code>
      </pre>
    );
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200"
          style={{ backgroundColor: colors.red }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 380 380"
            className="w-12 h-12"
          >
            <path
              fill="white"
              d="M282.83,170.73l-.27-.69-26.14-68.22a6.81,6.81,0,0,0-2.69-3.24,7,7,0,0,0-8,.43,7,7,0,0,0-2.32,3.52l-17.65,54H154.29l-17.65-54A6.86,6.86,0,0,0,134.32,99a7,7,0,0,0-8-.43,6.87,6.87,0,0,0-2.69,3.24L97.44,170l-.26.69a48.54,48.54,0,0,0,16.1,56.1l.09.07.24.17,39.82,29.82,19.7,14.91,12,9.06a8.07,8.07,0,0,0,9.76,0l12-9.06,19.7-14.91,40.06-30,.1-.08A48.56,48.56,0,0,0,282.83,170.73Z"
            />
          </svg>
        </button>
      ) : (
        <div 
          className="bg-white rounded-lg shadow-xl flex flex-col" 
          style={{ 
            height: '80vh', // Increased height
            width: '42rem',  // Increased width
            maxHeight: 'calc(100vh - 2rem)', // Prevent overflow beyond viewport
            maxWidth: 'calc(100vw - 2rem)' // Prevent overflow beyond viewport
          }}
        >
          {/* Chat Header */}
          <div className="p-4 rounded-t-lg flex justify-between items-center" style={{ backgroundColor: colors.red }}>
            <h2 className="text-white font-semibold">GitLab Duo</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6 min-h-[20rem] bg-gray-50">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full text-gray-500">
                Start a conversation by sending a message
              </div>
            )}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start space-x-3 ${
                  message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                }`}
              >
                {message.sender === 'user' ? <UserAvatar /> : <AIAvatar />}
                <div
                  className={`max-w-[85%] p-3 rounded-lg relative ${
                    message.sender === 'user'
                      ? 'text-white rounded-tr-none'
                      : 'bg-white text-gray-800 rounded-tl-none'
                  }`}
                  style={{ backgroundColor: message.sender === 'user' ? colors.orange : 'white' }}
                >
                  {message.sender === 'user' ? (
                    <p className="text-sm break-words">{message.content}</p>
                  ) : (
                    <div className="text-sm markdown-content overflow-x-auto">
                      <ReactMarkdown
                        components={{
                          h1: ({node, ...props}) => <h1 className={markdownStyles.h1} {...props} />,
                          h2: ({node, ...props}) => <h2 className={markdownStyles.h2} {...props} />,
                          h3: ({node, ...props}) => <h3 className={markdownStyles.h3} {...props} />,
                          p: ({node, ...props}) => <p className={markdownStyles.p} {...props} />,
                          ul: ({node, ...props}) => <ul className={markdownStyles.ul} {...props} />,
                          ol: ({node, ...props}) => <ol className={markdownStyles.ol} {...props} />,
                          li: ({node, ...props}) => <li className={markdownStyles.li} {...props} />,
                          code: ({node, inline, className, children, ...props}) => 
                            inline ? (
                              <code className={markdownStyles.code} {...props}>{children}</code>
                            ) : (
                              <CodeBlock className={className}>{children}</CodeBlock>
                            ),
                          blockquote: ({node, ...props}) => <blockquote className={markdownStyles.blockquote} {...props} />,
                          a: ({node, ...props}) => <a className={markdownStyles.a} {...props} />,
                          strong: ({node, ...props}) => <strong className={markdownStyles.strong} {...props} />,
                          em: ({node, ...props}) => <em className={markdownStyles.em} {...props} />,
                          pre: ({node, ...props}) => (
                            <div className="overflow-x-auto">
                              <pre {...props} className={`${markdownStyles.pre} min-w-full`} />
                            </div>
                          )
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  )}
                  <span className="text-xs opacity-75 block mt-1">
                    {message.timestamp}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button
                type="submit"
                className="text-white p-2 rounded-lg hover:opacity-90 transition-opacity duration-200"
                style={{ backgroundColor: colors.red }}
              >
                <svg 
                  className="w-6 h-6" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;