# Pratyogita Server Backend

This README will guide you through setting up and running the backend for the Pratyogita project.

---

## Table of Contents
- [Project Overview](#project-overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Server](#running-the-server)
- [Folder Structure](#folder-structure)
- [Troubleshooting](#troubleshooting)

---

## Project Overview
Pratyogita is a contest management backend built with Node.js and TypeScript. It provides APIs for authentication, contest management, user management, and more.

## Prerequisites
- Node.js (v16 or above recommended)
- npm (comes with Node.js)
- Git
- A database (MySQL recommended)

## Installation
1. **Clone the repository:**
   ```powershell
   git clone <repository-url>
   cd pratyogita-server
   ```
2. **Install dependencies:**
   ```powershell
   npm install
   ```

## Environment Variables
The backend uses environment variables for configuration. These are stored in `config.env` at the project root. You can use `example.env` as a template.

### How to Set Up
1. Copy `example.env` to `config.env`:
   ```powershell
   copy example.env config.env
   ```
2. Edit `config.env` and fill in the required values. Below is a description of each variable:

| Variable Name          | Description                                               | How to Get/Set                                      |
|-----------------------|-----------------------------------------------------------|-----------------------------------------------------|
| `DB_HOST`             | Hostname for your database server                         | Usually `localhost` for local dev, or your DB host   |
| `DB_USER`             | Database username                                         | Set to your DB username (e.g., `root`)              |
| `DB_PASSWORD`         | Database password                                         | Set to your DB password                             |
| `DB_NAME`             | Name of the database to use                               | Create a DB named `pratyogita` or your choice       |
| `JWT_SECRET`          | Secret key for JWT authentication                         | Generate a strong random string                     |
| `JWT_EXPIRE_IN`       | JWT token expiry duration (e.g., `90d` for 90 days)       | Set as needed (e.g., `90d`, `1d`, `12h`)            |
| `GOOGLE_CLIENT_ID`    | Google OAuth client ID                                    | Get from Google Cloud Console (OAuth credentials)    |
| `GOOGLE_CLIENT_SECRET`| Google OAuth client secret                                | Get from Google Cloud Console (OAuth credentials)    |

#### Example `config.env`
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=pratyogita
JWT_SECRET=your_jwt_secret
JWT_EXPIRE_IN=90d
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

#### Getting Google OAuth Credentials
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Create a new project (if needed)
- Navigate to **APIs & Services > Credentials**
- Create OAuth 2.0 Client IDs
- Copy the Client ID and Client Secret into your `config.env`

> **Important:** Never commit your `config.env` file with sensitive data to public repositories.

## Database Setup
1. Ensure your database server is running.
2. Use the provided SQL [dump file](./database/Dump20250918.sql) to create the necessary tables and seed the initial data.

#### Steps to Import SQL Dump using MySQL Workbench
1. Open MySQL Workbench and connect to your database server.
2. Select your target database (e.g., `pratyogita`).

    >⚠️ **Important: Database Creation**
- If the database (e.g., `pratyogita`) does **not** already exist, you must create it before importing the SQL dump:  
  ```sql
  CREATE DATABASE pratyogita;
  ```
- If the database already exists and contains data you don’t need, you should drop it and recreate it to avoid conflicts:
  ```sql
  DROP DATABASE pratyogita;
  CREATE DATABASE pratyogita;
  ```
3. Go to **Server > Data Import**.
4. Choose **Import from Self-Contained File** and select the SQL dump file.
5. Under **Default Schema to be Imported To**, select your database.
6. Click **Start Import** to execute the import process.


## Running the Server
- **Start the server:**
  ```powershell
  npm run start
  ```
- **Development mode (with auto-reload):**
  ```powershell
  npm run dev
  ```

> **Tip:** use `npm run dev` for running locally.

## Folder Structure
- `src/controllers/` - API controllers
- `src/routes/` - Route definitions
- `src/utils/` - Utility functions
- `db/` - Database configuration
- `uploads/` - Uploaded files

## Troubleshooting
- Ensure all environment variables are set correctly in `config.env`.
- Make sure your database is running and accessible.
- Check logs for errors and stack traces.
- For OAuth issues, verify your Google credentials and redirect URIs.

---

**For questions or issues, open an issue in the repository.**
