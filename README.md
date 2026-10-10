# University Research Opportunity Portal

A full-stack web application designed for university academic departments where faculty members can publish, update, track, and close student research opportunities, and undergraduate/graduate students can discover and explore research openings in real time.

---

## 📌 Project Overview & Features

### Core Features
- **Browse Opportunities:** Interactive responsive catalog displaying active and past research openings with real-time badges indicating position availability and deadlines.
- **Detailed Modal Inspector:** Deep-dive modal view displaying full project scope, supervisor information, department, available seats, and prerequisite skill tags.
- **Publish New Research Projects:** Validation-backed modal form enabling faculty members to post research vacancies with automated server-side sanitization.
- **Update Existing Postings:** Pre-filled edit form permitting supervisors to adjust descriptions, expand available positions, or push application deadlines.
- **One-Click Status Closure:** Faculty can transition an opportunity from `Open` to `Closed` with a single click once candidate spots are filled.
- **Safe Record Deletion:** Modal confirmation mechanism preventing accidental data loss before executing server-side deletions.
- **Search & Dynamic Filtering:** Server-side search by title, research area, faculty supervisor, or department (the frontend sends a debounced `?search=` request to the API and MySQL performs the `LIKE` matching), paired with an `Open` / `Closed` status filter (`?status=`).
- **Defensive Security & Validation:** Parameterized SQL queries preventing SQL Injection, rigorous client/server input validation, and automatic HTML entity escaping eliminating Cross-Site Scripting (XSS).

---

## 🛠 Tech Stack

| Layer | Technology | Details |
|---|---|---|
| **Backend Runtime** | Node.js | v18.x or v20.x LTS |
| **Web Framework** | Express.js | RESTful routing, static serving, centralized error handling |
| **Database** | MySQL | Relational storage via `mysql2/promise` connection pool |
| **Configuration** | `dotenv` | Environment variable management |
| **Middleware** | `cors` | Cross-Origin Resource Sharing enabled |
| **Frontend** | HTML5, CSS3, Vanilla JS | Single-Page Application (SPA) feel, no build step required |
| **CSS Framework** | Bootstrap 5.3.3 + Icons | CDN-delivered responsive layouts and modern interactive components |
| **Dev Tooling** | `nodemon` | Hot-reloading development server |

---

## 📋 Prerequisites

Before running the project, verify that the following dependencies are installed on your machine:
1. **Node.js**: `v18.0.0` or higher ([Download Node.js](https://nodejs.org/))
   - Verify: `node -v`
2. **npm**: `v9.0.0` or higher
   - Verify: `npm -v`
3. **MySQL Server**: `v8.0` or higher (or MariaDB `v10.4+`)
   - Verify: `mysql --version`

---

## 🚀 Step-by-Step Setup & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/sherry-0516/research-opportunity-portal.git
cd research-opportunity-portal
```

### 2. Set Up the MySQL Database

#### Option A: Using the MySQL Command-Line Client (CLI)

**Windows Command Prompt (cmd) or Linux / macOS terminal:**
```bash
mysql -u root -p < database/schema.sql

# (Optional) Load sample test data
mysql -u root -p < database/sample_data.sql
```

**Windows PowerShell** (PowerShell does not support the `<` operator, so use a pipe instead):
```powershell
Get-Content database\schema.sql | mysql -u root -p

# (Optional) Load sample test data
Get-Content database\sample_data.sql | mysql -u root -p
```

**Any terminal (alternative):** log in first, then run the script from inside MySQL:
```sql
mysql -u root -p
source database/schema.sql;
source database/sample_data.sql;   -- optional
```
> Run these commands from the project root folder so the relative `database/...` path resolves.

#### Option B: Using MySQL Workbench
1. Launch **MySQL Workbench** and connect to your local MySQL instance.
2. Go to **File -> Open SQL Script...** and select `database/schema.sql`.
3. Click the **Execute (Lightning Bolt ⚡)** button to create the `research_portal` database and `research_opportunities` table.
4. *(Optional)* Repeat the step with `database/sample_data.sql` to populate sample research opportunities.

---

#### Option C: Using the built-in setup script (no Workbench or `mysql` CLI needed)

If MySQL Workbench or the `mysql` command is not working, the project can create the database for you. This only needs MySQL Server to be running.

1. Complete **Step 3** (create `backend/.env`) and **Step 4** (`npm install`) below first.
2. From the `backend` folder run:
```bash
npm run setup-db

# (Optional) also insert 3 sample rows
npm run setup-db -- --sample
```
The script reads `database/schema.sql` and runs it using the credentials in your `.env`. It is safe to run more than once.

### 3. Configure Backend Environment Variables
Navigate into the backend directory:
```bash
cd backend
```
Copy the `.env.example` file to create your active `.env`:

**On Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
```
**On Linux / macOS:**
```bash
cp .env.example .env
```

Open `.env` in any text editor and adjust the values according to your local MySQL configuration:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_actual_mysql_password
DB_NAME=research_portal
DB_PORT=3306
```

---

### 4. Install Dependencies
Inside the `backend/` directory, install all packages:
```bash
npm install
```

---

### 5. Run the Application

#### Development Mode (with automatic restart on code changes):
```bash
npm run dev
```

#### Production / Standard Mode:
```bash
npm start
```

Upon successful startup, the terminal will display:
```text
====================================================
🚀 University Research Opportunity Portal
🌐 Server running at: http://localhost:3000
📡 API Base Endpoint: http://localhost:3000/api/opportunities
💻 Web Application:   http://localhost:3000/
====================================================
✅ Successfully connected to MySQL database: research_portal
```

---

### 6. Access the Application
Open your web browser and navigate to:
```text
http://localhost:3000
```
*(The backend serves the frontend statically, so you do not need an external web server or build tool!)*

---

## 📡 REST API Documentation

**Base Path:** `/api/opportunities`

| Method | Endpoint | Description | Request Body | Success Code | Error Codes |
|---|---|---|---|---|---|
| `POST` | `/api/opportunities` | Create a new research opportunity | JSON object with all required fields | `201 Created` | `400`, `500` |
| `GET` | `/api/opportunities` | Retrieve all opportunities (supports `?status=` and `?search=`) | None | `200 OK` | `500` |
| `GET` | `/api/opportunities/:id` | Retrieve a specific opportunity by ID | None | `200 OK` | `400`, `404`, `500` |
| `PUT` | `/api/opportunities/:id` | Update opportunity fields or change status | JSON object with updatable fields | `200 OK` | `400`, `404`, `500` |
| `DELETE` | `/api/opportunities/:id` | Permanently delete an opportunity | None | `200 OK` | `400`, `404`, `500` |

---

### Example Requests & Responses

#### 1. Create Opportunity (`POST /api/opportunities`)
**Request Body:**
```json
{
  "title": "Edge AI Optimization for Drone Networks",
  "description": "Investigating lightweight neural network acceleration and low-latency packet routing on constrained embedded edge devices deployed across collaborative aerial drone swarms.",
  "research_area": "Edge Computing & Networks",
  "faculty_name": "Dr. Aris Thorne",
  "department": "Computer Science & Engineering",
  "required_skills": "Python, PyTorch, C++, Linux Embedded Systems, Socket Programming",
  "available_positions": 3,
  "application_deadline": "2026-11-15",
  "status": "Open"
}
```
**Response (`201 Created`):**
```json
{
  "success": true,
  "message": "Research opportunity created successfully",
  "data": {
    "id": 1,
    "title": "Edge AI Optimization for Drone Networks",
    "description": "Investigating lightweight neural network acceleration and low-latency packet routing on constrained embedded edge devices deployed across collaborative aerial drone swarms.",
    "research_area": "Edge Computing & Networks",
    "faculty_name": "Dr. Aris Thorne",
    "department": "Computer Science & Engineering",
    "required_skills": "Python, PyTorch, C++, Linux Embedded Systems, Socket Programming",
    "available_positions": 3,
    "application_deadline": "2026-11-15",
    "status": "Open",
    "created_at": "2026-10-10 14:30:00",
    "updated_at": "2026-10-10 14:30:00"
  }
}
```

#### 2. Get All Opportunities (`GET /api/opportunities`)
**Response (`200 OK`):**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": 1,
      "title": "Edge AI Optimization for Drone Networks",
      "description": "Investigating lightweight neural network acceleration...",
      "research_area": "Edge Computing & Networks",
      "faculty_name": "Dr. Aris Thorne",
      "department": "Computer Science & Engineering",
      "required_skills": "Python, PyTorch, C++, Linux Embedded Systems, Socket Programming",
      "available_positions": 3,
      "application_deadline": "2026-11-15",
      "status": "Open",
      "created_at": "2026-10-10 14:30:00",
      "updated_at": "2026-10-10 14:30:00"
    }
  ]
}
```

#### 3. Update Opportunity (`PUT /api/opportunities/:id`)
**Request Body:**
```json
{
  "available_positions": 4,
  "status": "Closed"
}
```
**Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Research opportunity updated successfully",
  "data": {
    "id": 1,
    "title": "Edge AI Optimization for Drone Networks",
    "available_positions": 4,
    "status": "Closed",
    "updated_at": "2026-10-10 14:35:00"
  }
}
```

#### 4. Validation Error Response (`400 Bad Request`)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "title is required and cannot be empty.",
    "available_positions must be an integer greater than or equal to 1.",
    "application_deadline is required and must be a valid date in YYYY-MM-DD format."
  ]
}
```

#### 5. Resource Not Found (`404 Not Found`)
```json
{
  "success": false,
  "message": "Research opportunity not found with ID: 99"
}
```

---

## 📁 Project Directory Structure

```text
research-opportunity-portal/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                        # MySQL connection pool configuration (mysql2/promise)
│   │   ├── controllers/
│   │   │   └── opportunityController.js     # Parameterized SQL queries & CRUD logic
│   │   ├── middleware/
│   │   │   ├── errorHandler.js              # Centralized 404 & 500 error handlers
│   │   │   └── validate.js                  # Request body and param validation
│   │   ├── routes/
│   │   │   └── opportunityRoutes.js         # Express route endpoints mapping
│   │   └── app.js                           # Express application configuration & middlewares
│   ├── scripts/
│   │   └── setup-db.js                      # One-command DB setup (npm run setup-db)
│   ├── server.js                            # Server entrypoint and DB connection bootstrapper
│   ├── package.json                         # Dependencies and lifecycle scripts
│   └── .env.example                         # Environment configuration template
├── frontend/
│   ├── index.html                           # Single-page UI with Bootstrap 5 components
│   ├── css/
│   │   └── style.css                        # Custom typography, cards, and transitions
│   └── js/
│       ├── api.js                           # Modular fetch() client for backend API
│       └── app.js                           # UI controller, client-side validation, DOM rendering
├── database/
│   ├── schema.sql                           # Database initialization & table creation script
│   └── sample_data.sql                      # Optional 3 sample rows for testing
├── postman/
│   └── Research-Opportunity-Portal.postman_collection.json # Automated testing collection
├── .gitignore                               # Excludes node_modules, .env, and system files
└── README.md                                # Comprehensive project guide & documentation
```

---

## 🧪 Testing with Postman

A pre-configured, importable Postman collection is located at:
`postman/Research-Opportunity-Portal.postman_collection.json`

### How to Import & Run:
1. Open **Postman**.
2. Click **Import** (top-left) and select `postman/Research-Opportunity-Portal.postman_collection.json`.
3. The collection provides the collection variable `baseUrl` set to `http://localhost:3000`.
4. Run requests in sequential order:
   1. **Create Opportunity #1**: Automatically captures `data.id` and assigns it to `{{opportunityId}}`.
   2. **Create Opportunity #2 & #3**: Creates additional records.
   3. **Get All Opportunities**: Verifies status `200` and array payload.
   4. **Get One Opportunity by ID**: Verifies individual retrieval.
   5. **Update Opportunity**: Tests partial modification of title and positions.
   6. **Close Opportunity**: Sets status to `Closed`.
   7. **Delete Opportunity**: Permanently removes the test record.
   8. **Get Deleted Opportunity**: Tests `404 Not Found` response.
   9. **Create with Invalid Data**: Tests server-side `400 Bad Request` validation array.

---

## 🔒 Security Note
- **No Credentials in Version Control:** All sensitive parameters (`DB_PASSWORD`, `DB_USER`, `PORT`) are managed strictly through environment variables loaded via `.env`.
- **SQL Injection Prevention:** Every query in the codebase uses parameterized SQL placeholders (`?`) executed through `mysql2/promise`. String concatenation is never used.
- **Cross-Site Scripting (XSS) Prevention:** The frontend utilizes `textContent` and an entity escaping utility (`escapeHTML`) before injecting dynamic values into the DOM.

---

## ❓ Troubleshooting

| Issue | Cause | Solution |
|---|---|---|
| `ER_ACCESS_DENIED_ERROR` | Incorrect MySQL username or password in `.env` | Double-check `DB_USER` and `DB_PASSWORD` in `backend/.env`. Ensure the user has permissions on `research_portal`. |
| `EADDRINUSE: address already in use :::3000` | Port 3000 is occupied by another process | Either stop the running process or change `PORT=3001` in `.env`. |
| `ECONNREFUSED 127.0.0.1:3306` | MySQL server service is stopped | Start the MySQL service via Windows Services, `net start mysql`, or macOS/Linux `sudo systemctl start mysql`. |
| `The '<' operator is reserved for future use` (PowerShell) | PowerShell cannot redirect input with `<` | Use `Get-Content database\schema.sql \| mysql -u root -p`, or run the script in Command Prompt / MySQL Workbench. |
| Frontend displays network error alert | Backend is not running or CORS blocked | Ensure the Node.js server is actively running at `http://localhost:3000`. |

---

## 👤 Author Information

- **Student Name:** Muhammad Sheharyar
- **Registration Number:** P24-0516
- **Class / Section:** BS (CS 5C)
- **Email:** muhammadsheharyar459@gmail.com
- **Course:** Computer Networks (CN) - Assignment #01
- **GitHub Repository:** `https://github.com/sherry-0516/research-opportunity-portal`
