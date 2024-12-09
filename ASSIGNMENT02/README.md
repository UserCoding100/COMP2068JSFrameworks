# **Expense Tracker Application**

## **Table of Contents**
1. [Introduction](#introduction)
2. [Features](#features)
3. [Technologies Used](#technologies-used)
4. [Installation](#installation)
5. [Database Setup](#database-setup)
6. [Authentication](#authentication)
7. [CRUD Operations](#crud-operations)
8. [Additional Feature](#additional-feature)
9. [Chart.js Integration](#chartjs-integration)
10. [Deployment](#deployment)
11. [Live Demo](#live-demo)
12. [Version Control](#version-control)

---

## **Introduction**
The **Expense Tracker Application** is a web-based tool designed to help users track, manage, and analyze their daily expenses effectively. It provides a professional interface with modern features such as secure authentication, CRUD operations, and interactive data visualizations.

---

## **Features**
- User registration and login (local and GitHub authentication).
- Dashboard to add, edit, and delete expenses.
- Real-time data visualization using **Chart.js**.
- Dynamic categories for tracking expenses.
- Secure database setup with MongoDB Atlas.
- Responsive design for mobile and desktop.

---

## **Technologies Used**
- **Backend:** Node.js, Express.js
- **Frontend:** HTML, CSS, Handlebars.js
- **Database:** MongoDB Atlas
- **Authentication:** Passport.js (Local and GitHub OAuth)
- **Visualization:** Chart.js

---

## **Database Setup**
The application uses **MongoDB Atlas** for storing data. It has three collections:
1. **users:** Stores local user credentials.
2. **github_users:** Stores GitHub-authenticated user details.
3. **expenses:** Stores expense data linked to authenticated users.

### Example Document in `expenses`:
```json
{
  "_id": "64abcd12345",
  "user": "64xyz67890",
  "title": "Groceries",
  "amount": 200,
  "category": "Food",
  "date": "2024-12-05T12:00:00.000Z"
}
```

---

## **Authentication**
The app uses **Passport.js** for:
- Local authentication with username and password.
- GitHub OAuth authentication for seamless login.

---

## **CRUD Operations**
### **Dashboard**
Authenticated users can:
1. **View:** See a list of their expenses.
2. **Add:** Add new expenses with details like title, amount, category, and date.
3. **Edit:** Modify existing expenses.
4. **Delete:** Remove expenses with a confirmation prompt.

---

## **Github Authentication**
A feature implemented in this project is **GitHub OAuth Authentication**:
- Users can log in securely using their GitHub accounts.
- Details are stored in the `github_users` collection.

---

## **Additional Feature**
## **Chart.js Integration**
### **Purpose**
The application uses **Chart.js** to provide real-time visual insights into user expenses. The charts help users analyze their spending habits.

### **Implemented Charts**
1. **Bar Chart:**
   - Visualizes spending by categories.
   - Data is dynamically fetched from the database.
2. **Line Chart:**
   - Displays spending trends over time (optional, if implemented).

### **How It Works**
- Chart data is prepared on the backend and sent to the frontend via a `/chart-data` API endpoint.
- The data includes:
  - **Categories:** Labels for the chart (e.g., Food, Travel).
  - **Amounts:** Corresponding amounts spent in each category.
- Example API Response:
  ```json
  {
    "success": true,
    "data": {
      "categories": ["Food", "Travel", "Entertainment"],
      "amounts": [200, 150, 300]
    }
  }
  ```

- The frontend uses this data to render charts:
  ```javascript
  const ctx = document.getElementById('expenseChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: categories, // From API
      datasets: [{
        label: 'Spending by Category',
        data: amounts, // From API
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
      }]
    }
  });
  ```

### **Why Chart.js?**
- Lightweight and easy to integrate.
- Supports multiple chart types.
- Fully customizable and responsive.

---

## **Deployment**
The project is deployed on **Render**. Ensuring that all environment variables are configured for the production environment.

---

## **Live Demo**
- **URL:** https://expense-tracker-ozut.onrender.com/

---

## **Version Control**
- Minimum of 4 commits with descriptive messages and more have been made:

---