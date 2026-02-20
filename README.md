# 🎓 EduCoursePro - Full-Stack Online Learning Platform

A production-ready SaaS-level online course management platform built with **Django REST Framework** + **React (Vite)** + **PostgreSQL** + **JWT Authentication**.

---

## 🏗️ Project Structure

```
EduCoursePro/
├── backend/
│   ├── core/                   # Django settings, URLs, WSGI
│   ├── accounts/               # Custom user model, JWT auth, roles
│   ├── courses/                # Courses & Lectures CRUD
│   ├── payments/               # Purchase system
│   ├── analytics/              # Admin stats & analytics
│   ├── manage.py
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── context/            # AuthContext (JWT state)
    │   ├── routes/             # ProtectedRoute, AdminRoute, StudentRoute
    │   ├── services/           # Axios API service with JWT interceptors
    │   ├── layouts/            # PublicLayout, AdminLayout, StudentLayout
    │   ├── pages/
    │   │   ├── HomePage.jsx
    │   │   ├── CoursesPage.jsx
    │   │   ├── CourseDetailPage.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── admin/
    │   │   │   ├── AdminDashboard.jsx   # Analytics + Charts
    │   │   │   ├── AdminCourses.jsx     # Course management table
    │   │   │   ├── AdminCourseForm.jsx  # Create/Edit + Lecture upload
    │   │   │   ├── AdminUsers.jsx       # User management
    │   │   │   └── AdminPurchases.jsx   # Purchase tracking
    │   │   └── student/
    │   │       ├── StudentDashboard.jsx
    │   │       ├── MyCourses.jsx
    │   │       └── CoursePlayer.jsx     # Video player + PDF access
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── package.json
    └── vite.config.js
```

---

## ⚡ Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 14+

---

## 🔧 Backend Setup

### Step 1: Create Virtual Environment
```bash
cd backend
python -m venv venv

# Linux/Mac
source venv/bin/activate

# Windows
venv\Scripts\activate
```

### Step 2: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 3: Configure Environment
```bash
cp .env.example .env
# Edit .env with your database credentials and secret key
```

Generate a secret key:
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### Step 4: Create PostgreSQL Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE educoursepro;
\q
```

### Step 5: Run Migrations
```bash
python manage.py makemigrations accounts
python manage.py makemigrations courses
python manage.py makemigrations payments
python manage.py makemigrations
python manage.py migrate
```

### Step 6: Seed Initial Data
```bash
python manage.py seed_data
```

Creates:
- **Admin**: `admin@educoursepro.com` / `Admin@123`
- **Student**: `student@educoursepro.com` / `Student@123`
- 3 sample courses with lectures

### Step 7: Start Backend
```bash
python manage.py runserver
```
✅ API running at: `http://localhost:8000`

---

## 🎨 Frontend Setup

### Step 1: Install Dependencies
```bash
cd frontend
npm install
```

### Step 2: Start Dev Server
```bash
npm run dev
```
✅ Frontend running at: `http://localhost:5173`

---

## 🌐 API Reference

### Auth Endpoints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register/` | None | Register new user |
| POST | `/api/auth/login/` | None | Login → JWT tokens |
| POST | `/api/auth/logout/` | JWT | Blacklist refresh token |
| POST | `/api/auth/token/refresh/` | None | Get new access token |
| GET/PATCH | `/api/auth/profile/` | JWT | View/update profile |
| POST | `/api/auth/change-password/` | JWT | Change password |
| GET | `/api/auth/admin/users/` | ADMIN | List all users |
| GET/PATCH/DELETE | `/api/auth/admin/users/<id>/` | ADMIN | Manage user |

### Course Endpoints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/courses/` | None | List active courses |
| GET | `/api/courses/<id>/` | None | Course detail |
| GET | `/api/courses/my-courses/` | STUDENT | Purchased courses |
| GET | `/api/courses/<cid>/lectures/<lid>/access/` | JWT | Access lecture content |
| GET/POST | `/api/courses/admin/` | ADMIN | List/Create courses |
| GET/PATCH/DELETE | `/api/courses/admin/<id>/` | ADMIN | Manage course |
| GET/POST | `/api/courses/admin/<id>/lectures/` | ADMIN | Manage lectures |
| GET/PATCH/DELETE | `/api/courses/admin/<cid>/lectures/<id>/` | ADMIN | Manage lecture |

### Payment Endpoints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/payments/purchase/` | JWT | Purchase a course |
| GET | `/api/payments/my-purchases/` | JWT | User purchase history |
| GET | `/api/payments/check/<course_id>/` | JWT | Check if purchased |
| GET | `/api/payments/admin/purchases/` | ADMIN | All purchases |
| GET/PATCH | `/api/payments/admin/purchases/<id>/` | ADMIN | Manage purchase |

### Analytics Endpoints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/analytics/dashboard/` | ADMIN | Full dashboard stats |
| GET | `/api/analytics/user-growth/` | ADMIN | Monthly user growth |

---

## 🔐 Security Architecture

### JWT Flow
```
1. User logs in → receives access_token (60min) + refresh_token (7d)
2. Every API request: Authorization: Bearer <access_token>
3. Access token expires → Axios interceptor auto-calls /token/refresh/
4. Logout → refresh token blacklisted via SimpleJWT blacklist
```

### Role-Based Access
```
ADMIN  → All admin endpoints + course CRUD + user management
STUDENT → Purchase courses + access purchased content
Public  → Browse courses + watch free lectures
```

### Media File Protection
```
- Lecture videos: served only to purchasers via /api/courses/.../access/
- Notes PDFs: same protection as videos
- Course thumbnails: public (marketing material)
- Intro videos: public (free preview)
```

---

## 👤 User Roles

| Feature | Public | Student | Admin |
|---------|--------|---------|-------|
| Browse courses | ✅ | ✅ | ✅ |
| Watch intro video | ✅ | ✅ | ✅ |
| Purchase course | ❌ | ✅ | ✅ |
| Watch lectures | ❌ | ✅ (purchased) | ✅ |
| Download PDFs | ❌ | ✅ (purchased) | ✅ |
| Create courses | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |
| View analytics | ❌ | ❌ | ✅ |

---

## 🗄️ Database Models

### User
```python
email (unique), username, first_name, last_name
role: ADMIN | STUDENT
avatar, bio, is_active, created_at
```

### Course
```python
title, description, price (Decimal)
thumbnail (ImageField), intro_video (FileField)
is_active, created_by (FK→User), created_at
```

### Lecture
```python
course (FK→Course), title, description
video_file (FileField, protected), notes_pdf (FileField, protected)
is_free (Bool), order (Int), duration_minutes
```

### Purchase
```python
user (FK→User), course (FK→Course)
payment_status: PENDING | COMPLETED | FAILED | REFUNDED
amount_paid, payment_method, transaction_id (unique), purchased_at
```

---

## 🎯 Frontend Routes

| Route | Access | Component |
|-------|--------|-----------|
| `/` | Public | HomePage |
| `/courses` | Public | CoursesPage |
| `/courses/:id` | Public | CourseDetailPage |
| `/login` | Guest | LoginPage |
| `/register` | Guest | RegisterPage |
| `/dashboard` | Student | StudentDashboard |
| `/dashboard/my-courses` | Student | MyCourses |
| `/dashboard/course/:id` | Student | CoursePlayer |
| `/admin-dashboard` | Admin | AdminDashboard |
| `/admin-dashboard/courses` | Admin | AdminCourses |
| `/admin-dashboard/courses/new` | Admin | AdminCourseForm |
| `/admin-dashboard/courses/:id/edit` | Admin | AdminCourseForm |
| `/admin-dashboard/users` | Admin | AdminUsers |
| `/admin-dashboard/purchases` | Admin | AdminPurchases |

---

## 🚀 Production Deployment

### Backend (Gunicorn + Nginx)

**1. Set production environment:**
```env
DEBUG=False
SECRET_KEY=<very-strong-random-key>
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
```

**2. Collect static files:**
```bash
python manage.py collectstatic --noinput
```

**3. Run with Gunicorn:**
```bash
gunicorn core.wsgi:application \
  --workers 4 \
  --bind 0.0.0.0:8000 \
  --timeout 120 \
  --access-logfile -
```

**4. Systemd service** (`/etc/systemd/system/educoursepro.service`):
```ini
[Unit]
Description=EduCoursePro Django
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/educoursepro/backend
ExecStart=/var/www/educoursepro/venv/bin/gunicorn core.wsgi:application --workers 4 --bind 127.0.0.1:8000
EnvironmentFile=/var/www/educoursepro/backend/.env
Restart=always

[Install]
WantedBy=multi-user.target
```

### Frontend (Nginx)

**Build:**
```bash
npm run build
# Output in dist/
```

**Nginx config** (`/etc/nginx/sites-available/educoursepro`):
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend SPA
    location / {
        root /var/www/educoursepro/frontend/dist;
        try_files $uri $uri/ /index.html;
        expires 1h;
    }

    # Django API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        client_max_body_size 500M;  # For video uploads
    }

    # Django Admin
    location /django-admin/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
    }

    # Static & Media files
    location /static/ {
        alias /var/www/educoursepro/backend/staticfiles/;
        expires 30d;
    }

    location /media/ {
        alias /var/www/educoursepro/backend/media/;
        # Note: For production, serve protected media through Django views
        internal;
    }
}
```

---

## 💳 Real Payment Integration (Stripe)

Replace the simulated payment in `payments/views.py`:

**1. Install Stripe:**
```bash
pip install stripe
```

**2. Add to .env:**
```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**3. Frontend - Add Stripe Elements** for card input in `CourseDetailPage.jsx`.

**4. Webhook endpoint** to confirm payments asynchronously (see `payments/stripe_integration.py`).

---

## 📦 Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Backend Framework | Django 4.2 + Django REST Framework 3.14 |
| Authentication | SimpleJWT (Access + Refresh + Blacklist) |
| Database | PostgreSQL (via psycopg2) |
| File Uploads | Django FileField + Pillow |
| CORS | django-cors-headers |
| Frontend | React 18 + Vite |
| Routing | React Router v6 |
| HTTP Client | Axios (with JWT interceptors) |
| Charts | Recharts |
| Notifications | react-hot-toast |
| Icons | Lucide React |
| Production Server | Gunicorn + Nginx |
| Static Files | WhiteNoise |

---

## 🔧 Useful Commands

```bash
# Backend
python manage.py makemigrations    # Create migrations
python manage.py migrate           # Apply migrations
python manage.py seed_data         # Seed demo data
python manage.py createsuperuser   # Create admin manually
python manage.py collectstatic     # Collect static files

# Frontend
npm run dev        # Start dev server
npm run build      # Production build
npm run preview    # Preview production build
```

---

## 📬 Demo Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@educoursepro.com | Admin@123 |
| Student | student@educoursepro.com | Student@123 |

---

**Built with ❤️ — Production-Ready SaaS Architecture**
