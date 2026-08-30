

# The Anonymous Stories Project 📖

[![CI/CD Pipeline](https://github.com/hadar37/The-Anonymous-Stories-Project/actions/workflows/ci.yml/badge.svg)](https://github.com/hadar37/The-Anonymous-Stories-Project/actions/workflows/ci.yml)

An anonymous story-sharing backend application built with **Node.js**, **Express**, and **MongoDB Atlas**. The system provides RESTful APIs for user authentication, anonymous story publishing, and an admin panel for platform moderation, fully containerized using **Docker**.

---

## 🚀 Features

- **User Authentication:** Secure registration and login using JWT and bcrypt password hashing.
- **Story Management:** Create, read, and interact with anonymous user-contributed stories.
- **Admin Moderation:** Admin endpoints to manage users and moderate content.
- **Cloud Database Integration:** Connected seamlessly to MongoDB Atlas with robust authentication and connection pooling.
- **Containerized Deployment:** Fully configured Docker environment for seamless deployment across environments.
- **Automated Testing:** Automated test suite using Jest and Supertest.

---

## 🛠 Tech Stack & Tools

- **Runtime Environment:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas (via Mongoose ORM)
- **Authentication:** JSON Web Tokens (JWT) & Bcrypt
- **Testing & Coverage:** Jest, Supertest, `mongodb-memory-server`
- **DevOps & Containerization:** Docker, Docker Compose

---

## ⚙️ Environment Variables

Create a `.env` file in the `server` directory with the following variables:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.dooknhy.mongodb.net/myDatabase?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key