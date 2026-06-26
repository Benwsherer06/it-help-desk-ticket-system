import { useEffect, useState } from "react";
import { apiRequest } from "./api";
import "./App.css";

const emptyAuthForm = {
  name: "",
  email: "",
  password: ""
};

const emptyTicketForm = {
  title: "",
  description: "",
  category: "Hardware",
  priority: "Medium"
};

function App() {
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState(emptyAuthForm);
  const [ticketForm, setTicketForm] = useState(emptyTicketForm);
  const [user, setUser] = useState(() => getStoredUser());
  const [token, setToken] = useState(() => localStorage.getItem("helpdeskToken") || "");
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isLoggedIn = Boolean(user && token);

  useEffect(() => {
    if (isLoggedIn) {
      loadTickets(token);
    }
  }, [isLoggedIn, token]);

  function getStoredUser() {
    try {
      const storedUser = localStorage.getItem("helpdeskUser");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  }

  function updateAuthForm(event) {
    const { name, value } = event.target;

    setAuthForm((currentForm) => ({
      ...currentForm,
      [name]: value
    }));
  }

  function updateTicketForm(event) {
    const { name, value } = event.target;

    setTicketForm((currentForm) => ({
      ...currentForm,
      [name]: value
    }));
  }

  function clearAlerts() {
    setMessage("");
    setError("");
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    clearAlerts();
    setLoading(true);

    try {
      const endpoint = authMode === "login" ? "/auth/login" : "/auth/register";

      const body =
        authMode === "login"
          ? {
              email: authForm.email,
              password: authForm.password
            }
          : {
              name: authForm.name,
              email: authForm.email,
              password: authForm.password
            };

      const data = await apiRequest(endpoint, {
        method: "POST",
        body
      });

      localStorage.setItem("helpdeskToken", data.token);
      localStorage.setItem("helpdeskUser", JSON.stringify(data.user));

      setToken(data.token);
      setUser(data.user);
      setAuthForm(emptyAuthForm);
      setMessage(data.message);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadTickets(currentToken = token) {
    clearAlerts();

    try {
      const data = await apiRequest("/tickets/my", {
        token: currentToken
      });

      setTickets(data.tickets || []);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function handleTicketSubmit(event) {
    event.preventDefault();
    clearAlerts();
    setLoading(true);

    try {
      const data = await apiRequest("/tickets", {
        method: "POST",
        token,
        body: ticketForm
      });

      setTickets((currentTickets) => [data.ticket, ...currentTickets]);
      setSelectedTicket(data.ticket);
      setTicketForm(emptyTicketForm);
      setMessage("Ticket created successfully.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("helpdeskToken");
    localStorage.removeItem("helpdeskUser");

    setUser(null);
    setToken("");
    setTickets([]);
    setSelectedTicket(null);
    setMessage("");
    setError("");
  }

  function switchAuthMode(nextMode) {
    setAuthMode(nextMode);
    setAuthForm(emptyAuthForm);
    clearAlerts();
  }

  if (!isLoggedIn) {
    return (
      <main className="page">
        <section className="auth-card">
          <div className="brand-block">
            <p className="eyebrow">MVP Help Desk</p>
            <h1>IT Help Desk Ticket System</h1>
            <p className="subtext">
              Sign in or create an account to submit and track support tickets.
            </p>
          </div>

          <div className="tabs">
            <button
              className={authMode === "login" ? "tab active" : "tab"}
              type="button"
              onClick={() => switchAuthMode("login")}
            >
              Login
            </button>
            <button
              className={authMode === "register" ? "tab active" : "tab"}
              type="button"
              onClick={() => switchAuthMode("register")}
            >
              Sign up
            </button>
          </div>

          <form className="form" onSubmit={handleAuthSubmit}>
            {authMode === "register" && (
              <label>
                Name
                <input
                  name="name"
                  value={authForm.name}
                  onChange={updateAuthForm}
                  placeholder="Ben Sherer"
                />
              </label>
            )}

            <label>
              Email
              <input
                name="email"
                type="email"
                value={authForm.email}
                onChange={updateAuthForm}
                placeholder="ben@example.com"
              />
            </label>

            <label>
              Password
              <input
                name="password"
                type="password"
                value={authForm.password}
                onChange={updateAuthForm}
                placeholder="At least 6 characters"
              />
            </label>

            {error && <p className="alert error">{error}</p>}
            {message && <p className="alert success">{message}</p>}

            <button className="primary-button" type="submit" disabled={loading}>
              {loading ? "Working..." : authMode === "login" ? "Login" : "Create account"}
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard-page">
      <header className="topbar">
        <div>
          <p className="eyebrow">Logged in as {user.name}</p>
          <h1>IT Help Desk Ticket System</h1>
        </div>

        <button className="secondary-button" type="button" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <section className="dashboard-grid">
        <section className="panel">
          <h2>Create support ticket</h2>
          <p className="panel-text">
            Submit a new IT problem and it will be saved to your dashboard.
          </p>

          <form className="form" onSubmit={handleTicketSubmit}>
            <label>
              Title
              <input
                name="title"
                value={ticketForm.title}
                onChange={updateTicketForm}
                placeholder="Computer will not connect to Wi-Fi"
              />
            </label>

            <label>
              Description
              <textarea
                name="description"
                value={ticketForm.description}
                onChange={updateTicketForm}
                placeholder="Explain what is happening and what you already tried."
                rows="5"
              />
            </label>

            <div className="form-row">
              <label>
                Category
                <select name="category" value={ticketForm.category} onChange={updateTicketForm}>
                  <option>Hardware</option>
                  <option>Software</option>
                  <option>Network</option>
                  <option>Account</option>
                  <option>Other</option>
                </select>
              </label>

              <label>
                Priority
                <select name="priority" value={ticketForm.priority} onChange={updateTicketForm}>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </label>
            </div>

            {error && <p className="alert error">{error}</p>}
            {message && <p className="alert success">{message}</p>}

            <button className="primary-button" type="submit" disabled={loading}>
              {loading ? "Saving..." : "Create ticket"}
            </button>
          </form>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>My tickets</h2>
              <p className="panel-text">Tickets created by your account.</p>
            </div>

            <button className="small-button" type="button" onClick={() => loadTickets()}>
              Refresh
            </button>
          </div>

          {tickets.length === 0 ? (
            <div className="empty-state">
              <p>No tickets yet.</p>
              <span>Create one to test the MVP flow.</span>
            </div>
          ) : (
            <div className="ticket-list">
              {tickets.map((ticket) => (
                <button
                  className={
                    selectedTicket?.id === ticket.id ? "ticket-card selected" : "ticket-card"
                  }
                  key={ticket.id}
                  type="button"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <div>
                    <h3>{ticket.title}</h3>
                    <p>{ticket.category}</p>
                  </div>

                  <div className="ticket-meta">
                    <span>{ticket.priority}</span>
                    <strong>{ticket.status}</strong>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </section>

      {selectedTicket && (
        <section className="panel ticket-detail">
          <p className="eyebrow">Ticket detail</p>
          <h2>{selectedTicket.title}</h2>
          <p>{selectedTicket.description}</p>

          <div className="detail-grid">
            <span>Category: {selectedTicket.category}</span>
            <span>Priority: {selectedTicket.priority}</span>
            <span>Status: {selectedTicket.status}</span>
            <span>Created by: {selectedTicket.createdByName}</span>
          </div>
        </section>
      )}
    </main>
  );
}

export default App;