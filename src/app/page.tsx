'use client'

import { BsThreeDots } from "react-icons/bs";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import React, { useState, useRef, useEffect } from "react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FiSend, FiClipboard, FiCheck } from "react-icons/fi";

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

const ChatAIClone: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number>(-1);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const generateAnswer = async (question: string): Promise<string> => {
    try {
      const response = await axios({
        url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyDkBo0t1PCU8lj9W1HsDOqCcXIzuPtoW8c",
        method: "post",
        data: {
          "contents": [
            {
              "parts": [
                { "text": question }
              ]
            },
          ]
        }
      });
      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error("Error generating answer:", error);
      return "Sorry, there was an error generating the answer. Please try again.";
    }
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() === "") return;

    const newMessage: Message = {
      id: Date.now(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInputMessage("");
    setIsLoading(true);

    const aiResponse = await generateAnswer(inputMessage);

    const botResponse: Message = {
      id: Date.now(),
      text: aiResponse,
      sender: "ai",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prevMessages) => [...prevMessages, botResponse]);
    setIsLoading(false);
  };

  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(-1), 2000);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <h1 className="text-white text-center font-extrabold">Artificial AI Made by HassanRJ</h1>
      <div className="flex-1 p-4 overflow-hidden">
        <div
          ref={chatContainerRef}
          className="h-full overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-300"
          aria-live="polite"
        >
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl rounded-lg p-3 ${message.sender === "user" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-200"}`}
              >
                {message.sender === "user" ? (
                  <p className="text-sm">{message.text}</p>
                ) : (
                  <ReactMarkdown
                    components={{
                      code({inline, className, children, ...props }: {
                       
                        inline?: boolean;
                        className?: string;
                        children?: React.ReactNode;
                      }) {
                        const match = /language-(\w+)/.exec(className || "");
                        return !inline && match ? (
                          <div className="relative">
                            <SyntaxHighlighter
                              style={atomDark}
                              language={match[1]}
                              PreTag="div"
                              {...props}
                            >
                              {String(children).replace(/\n$/, "")}
                            </SyntaxHighlighter>
                            <button
                              onClick={() => handleCopyCode(String(children), index)}
                              className="absolute top-2 right-2 p-1 rounded bg-gray-600 text-white hover:bg-gray-500"
                            >
                              {copiedIndex === index ? <FiCheck /> : <FiClipboard />}
                            </button>
                          </div>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
                    }}
                    className="text-sm markdown-content"
                  >
                    {message.text}
                  </ReactMarkdown>
                )}
                <span className="text-xs text-gray-400 mt-1 block">
                  {message.timestamp}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-700 text-gray-200 rounded-lg p-3">
                <BsThreeDots className="text-xl animate-pulse" />
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="bg-gray-800 p-4">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type your message here..."
            className="flex-1 bg-gray-700 text-white rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Type your message"
          />
          <button
            onClick={handleSendMessage}
            className="bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Send message"
          >
            <FiSend className="text-xl" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatAIClone;