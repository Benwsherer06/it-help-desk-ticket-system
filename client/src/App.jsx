import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [backendMessage, setBackendMessage] = useState("Checking backend...");

  useEffect(() => {
    fetch("http://localhost:5000/api/health")
      .then((response) => response.json())
      .then((data) => {
        setBackendMessage(data.message);
      })
      .catch(() => {
        setBackendMessage("Backend is not connected");
      });
  }, []);

  return (
    <main className="app">
      <section className="card">
        <h1>IT Help Desk Ticket System</h1>
        <p>MVP build in progress.</p>
        <p>Backend status: {backendMessage}</p>
      </section>
    </main>
  );
}

export default App;