import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { apiRequest } from "./api";

const categories = ["Hardware", "Software", "Network", "Account", "Other"];
const priorities = ["Low", "Medium", "High"];
const statuses = ["Open", "In Progress", "Resolved", "Closed"];

function getSavedUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
}

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(getSavedUser());
  const [authMode, setAuthMode] = useState("login");
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loadingTickets, setLoadingTickets] = useState(false);

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: ""
  });

  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    adminCode: ""
  });

  const [ticketForm, setTicketForm] = useState({
    title: "",
    description: "",
    category: "Hardware",
    priority: "Low"
  });

  const [commentBody, setCommentBody] = useState("");

  const isAdmin = user?.role === "admin";

  const ticketCounts = useMemo(() => {
    return {
      total: tickets.length,
      open: tickets.filter((ticket) => ticket.status === "Open").length,
      inProgress: tickets.filter((ticket) => ticket.status === "In Progress").length,
      resolved: tickets.filter((ticket) => ticket.status === "Resolved").length
    };
  }, [tickets]);

  function clearMessages() {
    setMessage("");
    setError("");
  }

  function saveSession(data) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken("");
    setUser(null);
    setTickets([]);
    setSelectedTicket(null);
    setMessage("Logged out successfully.");
    setError("");
  }

  async function loadTickets() {
    if (!token || !user) {
      return;
    }

    try {
      setLoadingTickets(true);
      clearMessages();

      const endpoint = isAdmin ? "/tickets" : "/tickets/my";
      const data = await apiRequest(endpoint, {
        token
      });

      setTickets(data.tickets || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingTickets(false);
    }
  }

  async function loadTicketDetails(ticketId) {
    try {
      clearMessages();

      const data = await apiRequest(`/tickets/${ticketId}`, {
        token
      });

      setSelectedTicket(data.ticket);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRegister(event) {
    event.preventDefault();

    try {
      clearMessages();

      const body = {
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password
      };

      if (registerForm.adminCode.trim()) {
        body.adminCode = registerForm.adminCode.trim();
      }

      const data = await apiRequest("/auth/register", {
        method: "POST",
        body
      });

      saveSession(data);
      setRegisterForm({
        name: "",
        email: "",
        password: "",
        adminCode: ""
      });
      setMessage(`Account created. Logged in as ${data.user.role}.`);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleLogin(event) {
    event.preventDefault();

    try {
      clearMessages();

      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: loginForm
      });

      saveSession(data);
      setLoginForm({
        email: "",
        password: ""
      });
      setMessage(`Logged in as ${data.user.role}.`);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCreateTicket(event) {
    event.preventDefault();

    try {
      clearMessages();

      const data = await apiRequest("/tickets", {
        method: "POST",
        token,
        body: ticketForm
      });

      setTicketForm({
        title: "",
        description: "",
        category: "Hardware",
        priority: "Low"
      });

      setMessage("Ticket created successfully.");
      setSelectedTicket(data.ticket);
      await loadTickets();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleStatusChange(ticketId, status) {
    try {
      clearMessages();

      const data = await apiRequest(`/tickets/${ticketId}/status`, {
        method: "PATCH",
        token,
        body: {
          status
        }
      });

      setSelectedTicket(data.ticket);
      setMessage("Ticket status updated.");
      await loadTickets();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAddComment(event) {
    event.preventDefault();

    if (!selectedTicket) {
      return;
    }

    try {
      clearMessages();

      const data = await apiRequest(`/tickets/${selectedTicket.id}/comments`, {
        method: "POST",
        token,
        body: {
          body: commentBody
        }
      });

      setCommentBody("");
      setSelectedTicket(data.ticket);
      setMessage("Comment added successfully.");
      await loadTickets();
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadTickets();
  }, [token, user]);

  if (!token || !user) {
    return (
      <main className="page">
        <section className="auth-card">
          <div className="app-title">
            <h1>IT Help Desk Ticket System</h1>
            <p>Sign in or create an account to manage support tickets.</p>
          </div>

          <div className="tabs">
            <button
              className={authMode === "login" ? "active" : ""}
              onClick={() => {
                setAuthMode("login");
                clearMessages();
              }}
            >
              Login
            </button>
            <button
              className={authMode === "register" ? "active" : ""}
              onClick={() => {
                setAuthMode("register");
                clearMessages();
              }}
            >
              Sign Up
            </button>
          </div>

          {message && <div className="alert success">{message}</div>}
          {error && <div className="alert error">{error}</div>}

          {authMode === "login" ? (
            <form className="form" onSubmit={handleLogin}>
              <label>
                Email
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(event) =>
                    setLoginForm({
                      ...loginForm,
                      email: event.target.value
                    })
                  }
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(event) =>
                    setLoginForm({
                      ...loginForm,
                      password: event.target.value
                    })
                  }
                />
              </label>

              <button className="primary-button" type="submit">
                Log In
              </button>

              <div className="demo-box">
                <p>Demo user: user@example.com / password123</p>
                <p>Demo admin: admin@example.com / password123</p>
              </div>
            </form>
          ) : (
            <form className="form" onSubmit={handleRegister}>
              <label>
                Name
                <input
                  type="text"
                  value={registerForm.name}
                  onChange={(event) =>
                    setRegisterForm({
                      ...registerForm,
                      name: event.target.value
                    })
                  }
                />
              </label>

              <label>
                Email
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={(event) =>
                    setRegisterForm({
                      ...registerForm,
                      email: event.target.value
                    })
                  }
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(event) =>
                    setRegisterForm({
                      ...registerForm,
                      password: event.target.value
                    })
                  }
                />
              </label>

              <label>
                Admin Code
                <input
                  type="text"
                  placeholder="Optional"
                  value={registerForm.adminCode}
                  onChange={(event) =>
                    setRegisterForm({
                      ...registerForm,
                      adminCode: event.target.value
                    })
                  }
                />
              </label>

              <button className="primary-button" type="submit">
                Create Account
              </button>

              <div className="demo-box">
                <p>Leave admin code blank for a normal user.</p>
                <p>Use admin123 to create an admin account.</p>
              </div>
            </form>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard-page">
      <header className="top-bar">
        <div>
          <h1>IT Help Desk</h1>
          <p>
            Logged in as {user.name} <span className="role-badge">{user.role}</span>
          </p>
        </div>

        <div className="top-actions">
          <button className="secondary-button" onClick={loadTickets}>
            Refresh
          </button>
          <button className="danger-button" onClick={logout}>
            Log Out
          </button>
        </div>
      </header>

      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}

      <section className="stats-grid">
        <div className="stat-card">
          <span>Total Tickets</span>
          <strong>{ticketCounts.total}</strong>
        </div>
        <div className="stat-card">
          <span>Open</span>
          <strong>{ticketCounts.open}</strong>
        </div>
        <div className="stat-card">
          <span>In Progress</span>
          <strong>{ticketCounts.inProgress}</strong>
        </div>
        <div className="stat-card">
          <span>Resolved</span>
          <strong>{ticketCounts.resolved}</strong>
        </div>
      </section>

      <section className="content-grid">
        <div className="panel">
          <div className="panel-heading">
            <h2>{isAdmin ? "All Tickets" : "My Tickets"}</h2>
            <p>
              {isAdmin
                ? "Admin view shows every submitted ticket."
                : "User view shows only tickets created by this account."}
            </p>
          </div>

          {loadingTickets ? (
            <p className="empty-text">Loading tickets...</p>
          ) : tickets.length === 0 ? (
            <p className="empty-text">No tickets found.</p>
          ) : (
            <div className="ticket-list">
              {tickets.map((ticket) => (
                <button
                  key={ticket.id}
                  className={`ticket-card ${
                    selectedTicket?.id === ticket.id ? "selected" : ""
                  }`}
                  onClick={() => loadTicketDetails(ticket.id)}
                >
                  <div>
                    <h3>{ticket.title}</h3>
                    <p>{ticket.category} • {ticket.priority} priority</p>
                    {isAdmin && <p>Created by {ticket.createdByName}</p>}
                  </div>

                  <div className="ticket-meta">
                    <span className={`status-pill ${ticket.status.replaceAll(" ", "-").toLowerCase()}`}>
                      {ticket.status}
                    </span>
                    <span>{ticket.commentCount || 0} comments</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="panel">
          <div className="panel-heading">
            <h2>Create Ticket</h2>
            <p>Submit a new IT support request.</p>
          </div>

          <form className="form" onSubmit={handleCreateTicket}>
            <label>
              Title
              <input
                type="text"
                value={ticketForm.title}
                onChange={(event) =>
                  setTicketForm({
                    ...ticketForm,
                    title: event.target.value
                  })
                }
              />
            </label>

            <label>
              Description
              <textarea
                rows="5"
                value={ticketForm.description}
                onChange={(event) =>
                  setTicketForm({
                    ...ticketForm,
                    description: event.target.value
                  })
                }
              />
            </label>

            <label>
              Category
              <select
                value={ticketForm.category}
                onChange={(event) =>
                  setTicketForm({
                    ...ticketForm,
                    category: event.target.value
                  })
                }
              >
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>

            <label>
              Priority
              <select
                value={ticketForm.priority}
                onChange={(event) =>
                  setTicketForm({
                    ...ticketForm,
                    priority: event.target.value
                  })
                }
              >
                {priorities.map((priority) => (
                  <option key={priority}>{priority}</option>
                ))}
              </select>
            </label>

            <button className="primary-button" type="submit">
              Create Ticket
            </button>
          </form>
        </div>
      </section>

      <section className="panel detail-panel">
        <div className="panel-heading">
          <h2>Ticket Details</h2>
          <p>Select a ticket to view comments and status.</p>
        </div>

        {!selectedTicket ? (
          <p className="empty-text">No ticket selected.</p>
        ) : (
          <div className="ticket-detail">
            <div className="detail-header">
              <div>
                <h3>{selectedTicket.title}</h3>
                <p>Created by {selectedTicket.createdByName}</p>
              </div>

              <span className={`status-pill ${selectedTicket.status.replaceAll(" ", "-").toLowerCase()}`}>
                {selectedTicket.status}
              </span>
            </div>

            <div className="detail-grid">
              <div>
                <span>Category</span>
                <strong>{selectedTicket.category}</strong>
              </div>
              <div>
                <span>Priority</span>
                <strong>{selectedTicket.priority}</strong>
              </div>
              <div>
                <span>Created</span>
                <strong>{new Date(selectedTicket.createdAt).toLocaleString()}</strong>
              </div>
              <div>
                <span>Updated</span>
                <strong>{new Date(selectedTicket.updatedAt).toLocaleString()}</strong>
              </div>
            </div>

            <div className="description-box">
              <h4>Description</h4>
              <p>{selectedTicket.description}</p>
            </div>

            {isAdmin && (
              <div className="status-editor">
                <label>
                  Update Status
                  <select
                    value={selectedTicket.status}
                    onChange={(event) =>
                      handleStatusChange(selectedTicket.id, event.target.value)
                    }
                  >
                    {statuses.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </label>
              </div>
            )}

            <div className="comments-section">
              <h4>Comments</h4>

              {!selectedTicket.comments || selectedTicket.comments.length === 0 ? (
                <p className="empty-text">No comments yet.</p>
              ) : (
                <div className="comments-list">
                  {selectedTicket.comments.map((comment) => (
                    <div className="comment-card" key={comment.id}>
                      <div className="comment-top">
                        <strong>{comment.createdByName}</strong>
                        <span>{comment.createdByRole}</span>
                      </div>
                      <p>{comment.body}</p>
                      <small>{new Date(comment.createdAt).toLocaleString()}</small>
                    </div>
                  ))}
                </div>
              )}

              <form className="form comment-form" onSubmit={handleAddComment}>
                <label>
                  Add Comment
                  <textarea
                    rows="3"
                    value={commentBody}
                    onChange={(event) => setCommentBody(event.target.value)}
                  />
                </label>

                <button className="primary-button" type="submit">
                  Add Comment
                </button>
              </form>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export default App;