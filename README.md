IT Help Desk Ticket System

A full-stack help desk app where users can sign up, log in, create support tickets and also view their submitted tickets.

Current version

v0.2-beta

Current features

Users can create an account, log in, log out, create tickets, view their own tickets and add comments to their tickets.

Admin users can view all tickets, open ticket details, update ticket statuses and add comments.

The app includes basic validation and error handling for missing fields, duplicate accounts, invalid login information, blank comments and protected routes.

Tech stack

Frontend: React with Vite

Backend: Node.js and Express

Storage for beta: Local JSON file

Languages: JavaScript, JSX, CSS and JSON

Complexity anchors

Authentication and authorization

Role-based access control

Ticket comments and ticket data relationships

What is done

Signup and login

Password hashing

Login tokens

Protected routes

Regular user dashboard

Admin dashboard

Ticket creation

Ticket detail view

Ticket status updates

Ticket comments

Basic validation and error handling

Improved dashboard layout and user feedback

What is next

Replace local JSON storage with PostgreSQL

Add stronger search and filtering

Add technician assignment

Add automated tests

Add deployment

How to run the project

Clone the repo.

git clone https://github.com/Benwsherer06/it-help-desk-ticket-system.git

cd it-help-desk-ticket-system

Start the backend.

cd server

npm.cmd install

npm.cmd run dev

The backend runs at http://localhost:5000

Start the frontend in a second terminal.

cd client

npm.cmd install

npm.cmd run dev

The frontend runs at http://localhost:5173

How to test the beta

Start the backend and frontend.

Open http://localhost:5173 in the browser.

Create a normal user account.

Create an admin account using admin code admin123.

Log in as a regular user and create a ticket.

Add a comment to the ticket.

Log out and log in as the admin.

Confirm the admin can view all tickets.

Open a ticket.

Change the ticket status.

Add an admin comment.
