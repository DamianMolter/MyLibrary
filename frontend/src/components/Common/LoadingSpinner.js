import "./LoadingSpinner.css";

const LoadingSpinner = () => {
  return (
    <div className="loading-spinner-container">
      <div className="loading-spinner"></div>
      <p>Ładowanie...</p>
    </div>
  );
};

export default LoadingSpinner;
