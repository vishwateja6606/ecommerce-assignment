# ShopWave – Full-Stack E-Commerce Application

A full-stack e-commerce web application built with **React** (frontend) and **Spring Boot** (backend), featuring JWT authentication, OAuth2 SSO, Role-Based Access Control (RBAC), and a complete user profile management system.

---

## 📋 Features

### Authentication & Authorization

* **Local Auth** – Register and log in with username/password (JWT issued on login)
* **OAuth2 SSO** – Single Sign-On via Google, GitHub, and Facebook (OpenID Connect)
* **RBAC** – Two roles: `ADMIN` (full CRUD) and `USER` (read-only)
* **JWT** – Stateless token-based sessions; token stored in `localStorage`

### Product Dashboard

* Amazon/Flipkart-style product grid with images, categories, prices, and stock
* Search by keyword and filter by category
* **ADMIN**: Add, Edit, Delete products via modal form
* **USER**: Browse and view products only

### User Profile Management

* View and update personal info (name, phone, avatar)
* Change password (local accounts)
* Account settings tab with role/provider info

### Admin Panel (`/admin`)

* Stats overview (total products, stock, avg price, users)
* Full products CRUD table
* User management table (view all users and roles)

---

## 🏗 Tech Stack

| Layer    | Technology                                          |
| -------- | --------------------------------------------------- |
| Frontend | React 18, React Router v6, Axios, React-Toastify    |
| Backend  | Spring Boot 3.2, Spring Security 6, Spring Data JPA |
| Auth     | JWT (jjwt), OAuth2 Client (Spring Security)         |
| Database | MySQL                                               |
| Build    | Maven (backend), Create React App (frontend)        |

---

## 🚀 Quick Start

### Prerequisites

* Java 17+
* Node.js 18+
* Maven 3.8+

---

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/ecommerce-app.git
cd ecommerce-app
```

---

### 2. Start the Backend

```bash
cd backend
mvn spring-boot:run
```

Backend runs on:

```
http://localhost:8081
```

### Create database

```sql
CREATE DATABASE ecommerce;
```

### Update `application.yml`

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/ecommerce
    username: root
    password: your_password

  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
```

---

### 🔑 Default Accounts

| Username | Password  | Role       |
| -------- | --------- | ---------- |
| admin    | Admin@123 | ROLE_ADMIN |
| user     | User@123  | ROLE_USER  |

---

### 3. Start the Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm start
```

Frontend runs on:

```
http://localhost:3000
```

---

## 🔐 OAuth2 SSO Setup

### Google Setup

1. Go to https://console.cloud.google.com/
2. Create OAuth 2.0 Client ID
3. Add Redirect URI:

```
http://localhost:8081/login/oauth2/code/google
```

### Set Environment Variables

```bash
export GOOGLE_CLIENT_ID=your-google-client-id
export GOOGLE_CLIENT_SECRET=your-google-client-secret
```

---

## 📡 REST API Reference

### Auth APIs

| Method | Endpoint           | Access | Description   |
| ------ | ------------------ | ------ | ------------- |
| POST   | /api/auth/register | Public | Register user |
| POST   | /api/auth/login    | Public | Login (JWT)   |
| GET    | /api/auth/me       | Auth   | Current user  |

---

### Product APIs

| Method | Endpoint                      | Access | Description   |
| ------ | ----------------------------- | ------ | ------------- |
| GET    | /api/products                 | Public | List products |
| GET    | /api/products/{id}            | Public | Get product   |
| GET    | /api/products/search?keyword= | Public | Search        |
| GET    | /api/products/category/{cat}  | Public | Filter        |
| POST   | /api/products                 | ADMIN  | Create        |
| PUT    | /api/products/{id}            | ADMIN  | Update        |
| DELETE | /api/products/{id}            | ADMIN  | Delete        |

---

### User APIs

| Method | Endpoint                   | Access | Description     |
| ------ | -------------------------- | ------ | --------------- |
| GET    | /api/users/profile         | Auth   | Get profile     |
| PUT    | /api/users/profile         | Auth   | Update profile  |
| PUT    | /api/users/change-password | Auth   | Change password |
| GET    | /api/users                 | ADMIN  | List users      |
| GET    | /api/users/{id}            | ADMIN  | Get user        |

---

## 🛡 Security Architecture

```
Browser
  │
  ├─ /api/auth/login ──────────────► AuthController
  │                                        │
  │  ◄── JWT ──────────────────────────────┘
  │
  ├─ /oauth2/authorization/google ─► Spring OAuth2 → Google
  │                                        │
  │  ◄── redirect with token ────── OAuth2SuccessHandler
  │
  └─ /api/products (Bearer JWT) ──► JwtAuthFilter
                                         │
                                    SecurityContext
                                         │
                                    @PreAuthorize("hasRole('ADMIN')")
                                         │
                                    ProductController
```

---

## 🌐 Deployment

### Backend

```bash
cd backend
mvn clean package -DskipTests
java -jar target/ecommerce-backend.jar
```

---

### Frontend

```bash
cd frontend
npm run build
```

---

## 📄 License

MIT – free to use and modify.
