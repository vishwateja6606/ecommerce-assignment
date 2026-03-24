# ShopWave – Full-Stack E-Commerce Application

A full-stack e-commerce web application built with **React** (frontend) and **Spring Boot** (backend), featuring JWT authentication, OAuth2 SSO, Role-Based Access Control (RBAC), and a complete user profile management system.

---

## 📋 Features

### Authentication & Authorization
- **Local Auth** – Register and log in with username/password (JWT issued on login)
- **OAuth2 SSO** – Single Sign-On via Google, GitHub, and Facebook (OpenID Connect)
- **RBAC** – Two roles: `ADMIN` (full CRUD) and `USER` (read-only)
- **JWT** – Stateless token-based sessions; token stored in `localStorage`

### Product Dashboard
- Amazon/Flipkart-style product grid with images, categories, prices, and stock
- Search by keyword and filter by category
- **ADMIN**: Add, Edit, Delete products via modal form
- **USER**: Browse and view products only

### User Profile Management
- View and update personal info (name, phone, avatar)
- Change password (local accounts)
- Account settings tab with role/provider info

### Admin Panel (`/admin`)
- Stats overview (total products, stock, avg price, users)
- Full products CRUD table
- User management table (view all users and roles)

---

## 🏗 Tech Stack

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Frontend  | React 18, React Router v6, Axios, React-Toastify|
| Backend   | Spring Boot 3.2, Spring Security 6, Spring Data JPA |
| Auth      | JWT (jjwt), OAuth2 Client (Spring Security)     |
| Database  | MySQL|
| Build     | Maven (backend), Create React App (frontend)    |

---

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Node.js 18+
- Maven 3.8+

---

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/ecommerce-app.git
cd ecommerce-app
```

---

### 2. Start the Backend

cd backend
mvn spring-boot:run

Backend runs on:

http://localhost:8081

Create database:

CREATE DATABASE ecommerce;

Update application.yml:

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/ecommerce
    username: root
    password: your_password

  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
#### Default seeded accounts

| Username | Password   | Role       |
|----------|------------|------------|
| `admin`  | `Admin@123`| ROLE_ADMIN |
| `user`   | `User@123` | ROLE_USER  |

---

### 3. Start the Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm start
```

The frontend starts on **http://localhost:3000**.

---

## 🔐 OAuth2 SSO Setup

To enable SSO, register OAuth2 apps with each provider and add credentials:

### Google
1. Go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
2. Create an OAuth 2.0 Client ID (Web Application)
3. Add Authorized redirect URI: `http://localhost:8080/login/oauth2/code/google`

Then set environment variables (or edit `application.yml`):

```bash
export GOOGLE_CLIENT_ID=your-google-client-id
export GOOGLE_CLIENT_SECRET=your-google-client-secret
---

## 📡 REST API Reference

### Auth
| Method | Endpoint              | Access  | Description              |
|--------|-----------------------|---------|--------------------------|
| POST   | `/api/auth/register`  | Public  | Register new user        |
| POST   | `/api/auth/login`     | Public  | Login, returns JWT       |
| GET    | `/api/auth/me`        | Auth    | Current user info        |

### Products
| Method | Endpoint                        | Access | Description          |
|--------|---------------------------------|--------|----------------------|
| GET    | `/api/products`                 | Public | List all products    |
| GET    | `/api/products/{id}`            | Public | Get product by ID    |
| GET    | `/api/products/search?keyword=` | Public | Search products      |
| GET    | `/api/products/category/{cat}`  | Public | Filter by category   |
| POST   | `/api/products`                 | ADMIN  | Create product       |
| PUT    | `/api/products/{id}`            | ADMIN  | Update product       |
| DELETE | `/api/products/{id}`            | ADMIN  | Delete product       |

### Users
| Method | Endpoint                     | Access | Description           |
|--------|------------------------------|--------|-----------------------|
| GET    | `/api/users/profile`         | Auth   | Get own profile       |
| PUT    | `/api/users/profile`         | Auth   | Update own profile    |
| PUT    | `/api/users/change-password` | Auth   | Change password       |
| GET    | `/api/users`                 | ADMIN  | List all users        |
| GET    | `/api/users/{id}`            | ADMIN  | Get user by ID        |

---

## 📁 Project Structure

```
ecommerce-app/
├── backend/
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/ecommerce/
│       │   ├── EcommerceApplication.java
│       │   ├── config/
│       │   │   ├── SecurityConfig.java       # CORS, JWT, OAuth2, RBAC
│       │   │   └── DataInitializer.java      # Seeds users & products
│       │   ├── controller/
│       │   │   ├── AuthController.java       # Register, login, /me
│       │   │   ├── ProductController.java    # Product CRUD
│       │   │   └── UserController.java       # Profile management
│       │   ├── dto/                          # Request/response DTOs
│       │   ├── exception/                    # GlobalExceptionHandler
│       │   ├── model/
│       │   │   ├── User.java
│       │   │   ├── Product.java
│       │   │   └── Role.java (enum)
│       │   ├── repository/
│       │   │   ├── UserRepository.java
│       │   │   └── ProductRepository.java
│       │   └── security/
│       │       ├── JwtTokenProvider.java     # JWT generation & validation
│       │       ├── JwtAuthFilter.java        # Request filter
│       │       ├── UserPrincipal.java        # UserDetails wrapper
│       │       ├── CustomUserDetailsService.java
│       │       └── OAuth2SuccessHandler.java # SSO → JWT redirect
│       └── resources/
│           └── application.yml
│
└── frontend/
    ├── package.json
    ├── public/index.html
    └── src/
        ├── App.js                            # Routes
        ├── index.js
        ├── api/index.js                      # Axios + API helpers
        ├── context/AuthContext.js            # Auth state & JWT storage
        ├── components/
        │   ├── Navbar.js
        │   ├── ProtectedRoute.js
        │   └── ProductModal.js               # Create/Edit product form
        ├── pages/
        │   ├── LoginPage.js                  # Login + SSO buttons
        │   ├── RegisterPage.js
        │   ├── DashboardPage.js              # Product grid
        │   ├── ProfilePage.js                # User profile + password
        │   ├── AdminPage.js                  # Admin CRUD panel
        │   └── OAuth2RedirectPage.js         # OAuth2 token handler
        └── styles/global.css
```

---

## 🛡 Security Architecture

```
Browser
  │
  ├─ /api/auth/login ──────────────► AuthController
  │                                        │
  │  ◄── JWT ──────────────────────────────┘
  │
  ├─ /oauth2/authorize/google ─────► Spring OAuth2 → Google
  │                                        │
  │  ◄── redirect with ?token=JWT ─── OAuth2SuccessHandler
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

### Backend (JAR)
```bash
cd backend
mvn clean package -DskipTests
java -jar target/ecommerce-backend-1.0.0.jar \
  --spring.datasource.url=jdbc:postgresql://localhost/ecommercedb \
  --spring.datasource.username=postgres \
  --spring.datasource.password=secret \
  --app.jwt.secret=YOUR_256_BIT_SECRET
```

### Frontend (Static)
```bash
cd frontend
npm run build
# Serve the `build/` folder with Nginx, Vercel, Netlify, etc.
```

---

## 📄 License

MIT – free to use and modify.
# e-commerce
# e-commerce
# e-commerce
# e-commerce
# e-commerce
# e-commerce
# e-commerce
# e-commerce
