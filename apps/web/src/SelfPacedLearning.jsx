import React from "react";
import { useNavigate } from "react-router-dom";

const SelfPacedLearning = () => {
  const navigate = useNavigate();

  const styles = {
    container: {
      padding: "60px",
      fontFamily: "'Segoe UI', sans-serif",
      backgroundColor: "#fdf7e7",
      height: "100vh"
    },
    title: {
      fontSize: "40px",
      color: "#6C530E",
      marginBottom: "30px"
    },
    backBtn: {
      padding: "10px 18px",
      borderRadius: "10px",
      border: "none",
      backgroundColor: "#EE6A60",
      color: "#fff",
      cursor: "pointer"
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Self-Paced Quiz Area</h1>

      <button style={styles.backBtn} onClick={() => navigate("/")}>
        ← Back to Dashboard
      </button>

      {/* Your quiz UI will go here */}
    </div>
  );
};

export default SelfPacedLearning;