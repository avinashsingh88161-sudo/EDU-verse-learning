import React from "react";

const LoadingSpinner = ({ message = "Loading data..." }) => {
  return (
    <div className="loading-spinner-container">
      <div className="spinner-ring" />
      <span className="loading-message">{message}</span>
    </div>
  );
};

export default LoadingSpinner;
