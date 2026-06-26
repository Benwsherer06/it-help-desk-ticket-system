IT Help Desk Ticket System

A full stack help desk app where users can sign up, log in, create support tickets and also view their submitted tickets.

Current MVP features implemented:

Users can create an account, log in, log out, create a ticket and view their own tickets on the dashboard.

The app includes basic validation for missing fields, duplicate accounts and wrong login information.

Tech stack

Frontend: React with Vite

Backend: Node.js and Express

Storage for MVP: Local JSON file

Languages: JavaScript, JSX, CSS and JSON

Complexity anchor

Authentication and authorization

The MVP has signup, login, password hashing, login tokens and protected ticket routes.

Full tutorial:

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

The frontend runs at http://localhost:5173 normally

How to test the MVP:

Start the backend and frontend.

Open http://localhost:5173 in the browser.

Create an account.

Log out.

Log back in.

Create a ticket.

Check that the ticket appears on the dashboard.

Click the ticket to view the details.

Try to submit a blank ticket to confirm the error message works.

Future improvements

Add PostgreSQL.

Add technician or admin dashboard.

Add ticket comments.

Add ticket status updates.

Add search and filtering.

Add deployment.

As well as finish up all the issues that say "In Progress"
