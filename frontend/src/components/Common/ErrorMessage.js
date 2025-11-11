import React from "react";
import "./ErrorMessage.css";

const ErrorMessage = ({ message, onClose }) => {
  return (
    <div className="error-message">
      <span>⚠️ {message}</span>
      {onClose && (
        <button onClick={onClose} className="error-close">
          ×
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
