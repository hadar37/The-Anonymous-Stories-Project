

# The Anonymous Stories Project 📖

[![CI/CD Pipeline](https://github.com/YourUsername/The-Anonymous-Stories-Project/actions/workflows/ci.yml/badge.svg)](https://github.com/YourUsername/The-Anonymous-Stories-Project/actions/workflows/ci.yml)

An anonymous story-sharing backend application built with **Node.js**, **Express**, and **MongoDB**. The system provides RESTful APIs for user authentication, anonymous story publishing, and an admin panel for platform moderation.

---

## 🚀 Features

- **User Authentication:** Secure registration and login using JWT and bcrypt password hashing.
- **Story Management:** Create, read, and interact with anonymous user-contributed stories.
- **Admin Moderation:** Admin endpoints to manage users and delete offensive content.
- **In-Memory Testing:** Automated test suite using an in-memory MongoDB server for maximum environment independence.

---

## 🛠 Tech Stack & Tools

- **Runtime Environment:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (via Mongoose ORM)
- **Authentication:** JSON Web Tokens (JWT)
- **Testing & Coverage:** Jest, Supertest, `mongodb-memory-server`
- **Containerization / Ops:** Docker

---

## 📋 Prerequisites

Ensure you have the following installed on your machine:

- **Node.js** (v18.x or higher)
- **npm** (v9.x or higher)
- **MongoDB** (Local instance or MongoDB Atlas connection string)

---

## ⚙️ Installation & Setup

1. **Clone the Repository:**
   ```bash
   git clone [https://github.com/YourUsername/The-Anonymous-Stories-Project.git](https://github.com/YourUsername/The-Anonymous-Stories-Project.git)
   cd The-Anonymous-Stories-Project/server