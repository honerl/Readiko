import { useEffect, useState } from "react";
import { checkHealth } from "./services/api.js";

function App() {
  const [status, setStatus] = useState("Checking...");

  useEffect(() => {
    checkHealth()
      .then((data) => setStatus(data.ok ? "ok" : "not ok"))
      .catch(() => setStatus("Backend not connected"));
  }, []);

  return (
    <div>
      <h1>ReadIKo</h1>
      <p>Backend Status: {status}</p>
    </div>
  );
}

export default App;