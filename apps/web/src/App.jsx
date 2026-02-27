import { useEffect, useState } from "react";
import { checkHealth } from "./services/api.js";
import QuestionScreen from "./components/question_screen.jsx";

function App() {
  const [status, setStatus] = useState("Checking...");

  useEffect(() => {
    checkHealth()
      .then((data) => setStatus(data.ok ? "ok" : "not ok"))
      .catch(() => setStatus("Backend not connected"));
  }, []);

  return (
  <div className="app-wrapper">
      {/* Header Area */}
      <header className="app-header">
        <h1>ReadIKo</h1>
        <div className={`status-indicator ${status === 'Online' ? 'active' : ''}`}>
          Backend: {status}
        </div>
      </header>

    {/* Main Content Area */}
      <main className="main-layout">
        <QuestionScreen />
      </main>
    </div>
  );
}

export default App;