# College ERP Accountant Module Backend

A complete, production-ready REST API backend for a College ERP Accountant Module, built with the MERN stack (Node.js, Express.js, MongoDB, Mongoose). This application provides a comprehensive accounting system, complete with RBAC (Role-Based Access Control) authentication, automatic PDF generation for receipts and salary slips, detailed dashboard analytics with aggregation pipelines, and comprehensive multi-format report exports (PDF, Excel, CSV).

## Tech Stack

*   **Runtime:** Node.js (>= 18.0.0)
*   **Framework:** Express.js
*   **Database:** MongoDB
*   **ODM:** Mongoose
*   **Security:** JWT Access/Refresh tokens, Helmet, Bcryptjs, Cors, Morgan, Express Rate Limiter, Express Mongo Sanitize, XSS-Clean, Cookie Parser
*   **Reporting:** ExcelJS, PDFKit, CSV-Stringify, QRCode
*   **Testing:** Jest, Supertest, MongoDB Memory Server

## Key Features

1.  **Authentication & Security:** JWT tokens (stored in HTTP-only cookies), Secure Refresh Token rotations, Change/Forgot/Reset Password, and Email Verification.
2.  **Role-Based Access Control (RBAC):** High-grain permissions structure: `super_admin`, `principal`, `accountant`, `student`, and `parent`.
3.  **Complete Accountant CRUD Modules:** Fully functional APIs for Student profiles, Fee Structures, Student Fees, Receipts, Expenses, Incomes, Scholarships, and Salaries.
4.  **Automatic PDF Generation:** Dynamically generates printable PDF fee receipts (complete with base64 QR codes) and salary slips using `pdfkit`.
5.  **Multi-Format Export Engine:** High-performance exports of Daily Collections, Outstanding Balances, Profit & Loss reports to PDF, Excel (`exceljs`), or CSV (`csv-stringify`).
6.  **Dashboard Aggregations:** MongoDB Aggregation pipelines reporting today's collections, monthly revenues, pending fees, top pending students, and trend charts.
7.  **Audit Logs & In-App Alerts:** Action logs track creating/updating/deleting transactions, capturing IP and User Agent, alongside user notifications for due dates and payments.
8.  **Background Jobs:** Automated daily reminder emails and SMS notifications for upcoming dues running via `node-cron`.

---

## Installation

1.  Clone/open the repository:
    ```bash
    cd backend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Configure your environment variables (see the `.env.example` template):
    ```bash
    cp .env.example .env
    ```

4.  Configure your MongoDB URI (local or cloud) inside `.env`:
    ```env
    MONGO_URI=mongodb://localhost:27017/college_erp
    ```

---

## Database Seeding

To quickly populate the database with default admin accounts, principal credentials, accountants, students, and active fee structures:

```bash
npm run seed
```

### Seed Credentials:

*   **Super Admin:** `admin@college.edu` | `AdminPassword123!`
*   **Principal:** `principal@college.edu` | `PrincipalPassword123!`
*   **Accountant:** `accountant@college.edu` | `AccountantPassword123!`
*   **Student 1:** `alice@student.edu` | `StudentPassword123!`
*   **Student 2:** `bob@student.edu` | `StudentPassword123!`

---

## Running the Application

### Development Mode (with hot-reload):
```bash
npm run dev
```
The server will start running at `http://localhost:5000`.

### API Documentation (Swagger UI):
Once the server is running, navigate to:
```url
http://localhost:5000/api/docs
```

### Production Mode:
```bash
npm start
```

---

## Running Tests

We use Jest alongside MongoDB Memory Server to run tests without affecting local development data.

### Run All Tests:
```bash
npm run test
```

### Run Unit Tests only:
```bash
npm run test:unit
```

### Run Integration Tests only:
```bash
npm run test:integration
```

---

## Folder Structure

```text
backend/
├── seeders/                  # Database seeder scripts
├── src/
│   ├── config/               # DB, JWT, Multer, Mailer, Swagger config
│   ├── constants/            # Role hierarchy, status values, system messages
│   ├── controllers/          # Request handoff & HTTP response handlers
│   ├── docs/                 # Swagger configurations and JSON schemas
│   ├── helpers/              # Text formatting, file parsers
│   ├── jobs/                 # Cron tasks for upcoming fee reminders
│   ├── middleware/           # Auth, RBAC, Rate Limiter, XSS, Error, Audit logs
│   ├── models/               # MongoDB Mongoose database schemas
│   ├── repositories/         # Database access layer inheriting BaseRepository
│   ├── routes/               # Express endpoints router mounting
│   ├── services/             # Core business logical processes
│   ├── uploads/              # Local storage for documents/receipts
│   ├── utils/                # JWT, mail, SMS, QR code helpers
│   └── app.js                # Express app initialization
├── server.js                 # Entry node server listening on PORT
├── package.json              # App scripts and dependency lists
└── .env                      # Application environment variables
```

---

## API Summary Table

| Method | Endpoint | Description | Auth Roles Allowed |
| :--- | :--- | :--- | :--- |
| **POST** | `/auth/register` | Register a new user | Public |
| **POST** | `/auth/login` | Login and retrieve tokens | Public |
| **POST** | `/auth/refresh-token` | Renew expired Access Token | Public |
| **POST** | `/auth/logout` | Clear user session | Public |
| **POST** | `/auth/change-password` | Change user password | Authenticated (All) |
| **GET** | `/users` | Get paginated list of users | `super_admin`, `principal` |
| **GET** | `/students` | Get paginated list of students | `super_admin`, `principal`, `accountant` |
| **POST** | `/students/:id/documents` | Upload files for student profile | `super_admin`, `principal`, `accountant`, `student` |
| **POST** | `/student-fees` | Assign a new fee to a student | `super_admin`, `principal`, `accountant` |
| **POST** | `/student-fees/:id/pay` | Record a fee collection payment | `super_admin`, `principal`, `accountant` |
| **GET** | `/receipts/:id/download` | Download payment receipt PDF | `super_admin`, `principal`, `accountant`, `student`, `parent` |
| **POST** | `/expenses` | Record a college expenditure | `super_admin`, `principal`, `accountant` |
| **POST** | `/salaries` | Record and disburse staff salary | `super_admin`, `principal`, `accountant` |
| **GET** | `/salaries/:id/slip` | Download salary slip PDF | `super_admin`, `principal`, `accountant` |
| **GET** | `/reports/collection` | Export Collections (PDF, Excel, CSV) | `super_admin`, `principal`, `accountant` |
| **GET** | `/reports/profit-loss` | Export Profit & Loss Report | `super_admin`, `principal`, `accountant` |
| **GET** | `/dashboard/stats` | Retrieve general dashboard stats | `super_admin`, `principal`, `accountant` |
| **GET** | `/audit-logs` | Retrieve action audit logs | `super_admin` |
