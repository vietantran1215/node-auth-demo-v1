Here is the **cleaned-up requirement** (no optional parts) for building a **ReactJS app** using **React-Bootstrap** and **React Router**, consuming the given API:

---

## 🔧 Project Requirement: React App for Sign Up & Login with API Integration

### 🖥️ Tech Stack

* **ReactJS**
* **React Router**
* **React-Bootstrap**
* **Fetch API** (for HTTP requests)

---

## 🌐 Base API URL

```
http://localhost:8080/api
```

---

## 1. Application Structure

### 📁 Pages/Routes

* `/signup` → Sign Up Page
* `/login` → Login Page
* `/dashboard` → Success landing page (after login)

### 🧭 Navigation

* Use React-Bootstrap `<Navbar>` for navigation links.
* Use `react-router-dom` for page routing.

---

## 2. Sign Up Page

### 🔗 API Integration

* **Method:** `POST`
* **Endpoint:** `/signup`
* **Request Body:**

  ```json
  {
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "password": "secret123"
  }
  ```

### ✅ Functional Requirements

* Form fields: Name, Username, Email, Password
* Use React-Bootstrap form components
* Validate:

  * All fields are required
  * Email format
  * Minimum password length
* On success:

  * Redirect to `/login`
  * Show a success message
* On failure:

  * Display an error message using `<Alert variant="danger">`

---

## 3. Login Page

### 🔗 API Integration

* **Method:** `POST`
* **Endpoint:** `/login`
* **Request Body:**

  ```json
  {
    "username": "johndoe",
    "password": "secret123"
  }
  ```

### ✅ Functional Requirements

* Form fields: Username, Password
* Use React-Bootstrap form components
* Validate:

  * Both fields are required
* On success:

  * Redirect to `/dashboard`
  * Save auth data in `localStorage`
* On failure:

  * Display error using `<Alert variant="danger">`

---

## 4. UI/UX Guidelines

### ✅ Layout & Design

* Use `Container`, `Row`, `Col` for centered layout
* Style forms with `Card` components and spacing
* Fully responsive on all screen sizes

### ✅ User Experience

* Show loading indicator during API calls
* Disable submit button while submitting
* Inline form validation feedback
* Alerts for success/error

---

## 5. Code Structure

```
/src
  /components
    Navbar.js
    PrivateRoute.js
  /pages
    SignUpPage.js
    LoginPage.js
    Dashboard.js
  /api
    auth.js
  App.js
  index.js
```

---
