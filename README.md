# 🔐 SecureVault  
### End-to-End Encrypted File Storage

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-blue?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Backend-Spring%20Boot-green?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Database-MySQL-orange?style=for-the-badge"/>
  <br/>
  <img src="https://img.shields.io/badge/Encryption-AES--256--GCM-yellow?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/License-MIT-lightgrey?style=for-the-badge"/>
</p>

---

## 🛡️ About SecureVault

**SecureVault** is a full-stack, zero-knowledge platform designed for **secure file storage, encrypted collaboration, and team communication**.

All sensitive data is **encrypted on the client side** using **AES-256-GCM**, ensuring the backend **never sees plaintext data**.  
This makes SecureVault a true **end-to-end encrypted, privacy-first system**.

---

## ✨ Key Features

### 🔐 End-to-End Encryption
- Client-side encryption using **AES-256-GCM**
- Backend stores only encrypted data
- IVs and keys handled securely on the client
- Zero-knowledge architecture

### 🗂️ Secure File Vault
- Upload and manage encrypted files
- File version history
- Expiring shareable links (optional password)
- Per-team access control

### 📝 Encrypted Notes
- Secure notes vault
- Notes encrypted before storage
- Zero-knowledge note editor

### 🔑 Password Vault
- Store passwords, secrets, and API keys
- AES-256 client-side encryption
- Data never leaves the browser unencrypted

### 🛡️ Security Dashboard
- Active session & device management
- Login activity monitoring
- Two-factor authentication (OTP-based)
- Self-destruct mode (wipe all data instantly)

---

## 🚀 Tech Stack

### 🖥️ Frontend
- ⚛️ React + TypeScript
- ⚡ Vite
- 🎨 Tailwind CSS + shadcn/ui
- 🔐 Web Crypto API (AES-256-GCM)
- 📦 React Query + Context API

### 🛠️ Backend
- ☕ Spring Boot (Java 21)
- 🗄️ MySQL
- 🔐 JWT Authentication
- 🌐 REST API Architecture
- 📦 JPA / Hibernate

---

## 📁 Project Structure
securevault/
├── securevault-frontend/ # React + TypeScript (Vite)
└── securevault-backend/ # Spring Boot + MySQL


---

## 🧩 Frontend Setup
- git clone <repo-url>
- cd securevault-frontend
- npm install
- npm run dev
- Update API Base URL
- src/lib/api.ts
- export const API_BASE = "http://localhost:8080/api";

## ⚙️ Backend Setup
- cd securevault-backend
- mvn clean install
- mvn spring-boot:run

## Configure MySQL 
src/main/resources/application.properties

- spring.datasource.url=jdbc:mysql://localhost:3306/securevault
- spring.datasource.username=root
- spring.datasource.password=yourpassword
- spring.jpa.hibernate.ddl-auto=update


## ⭐ Support the Project

If this project helped you, consider giving it a ⭐ on GitHub —
it motivates future development!

