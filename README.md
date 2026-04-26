# Ascension System

A full-stack quest tracker inspired by leveling systems from anime.

## Stack

- React + Vite frontend
- Express backend
- Cookie-based authentication
- JSON file database at `server/data/db.json`

This is MERN-style in structure, but it uses a JSON-backed NoSQL-style datastore instead of MongoDB right now so every user can have a unique saved profile without adding a separate database service.

## Features

- Login and registration pages
- Unique per-user profile data
- Server-side quest progress, stat gains, streaks, and daily resets
- Custom quests stored per account
- Protected session endpoint and quest APIs
- Production build flow with Vite + Express

## Project Structure

- `src/` - React application
- `server/` - Express API and auth
- `shared/` - shared game logic used by both client and server
- `server/data/db.json` - JSON database file

## Local Development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a local environment file from `.env.example` and set a real `JWT_SECRET`.

3. Start the frontend and backend together:

   ```bash
   npm run dev
   ```

4. Open the frontend in your browser:

   ```text
   http://localhost:5173
   ```

## Production Build

1. Build the React app:

   ```bash
   npm run build
   ```

2. Start the Express server:

   ```bash
   npm start
   ```

3. Open:

   ```text
   http://localhost:4000
   ```

## Notes

- User accounts and progression are stored in `server/data/db.json`.
- Replace the JSON file datastore with MongoDB later if you want a fully traditional MERN deployment.
- Use a strong secret in `JWT_SECRET` before exposing this to real users.
