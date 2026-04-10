<div align="center">
    <picture>
    <source srcset="docs/logo_dark.png" media="(prefers-color-scheme: dark)">
    <source srcset="docs/logo_light.png" media="(prefers-color-scheme: light)">
    <img src="docs/logo_light.png" alt="Acadex logo" width="300">
    </picture>
</div>

<p align="center">
  <img src="https://img.shields.io/badge/Tauri-2.x-24C8DB?style=flat-square&logo=tauri&logoColor=white" alt="Tauri">
  <img src="https://img.shields.io/badge/React-19.x-61DAFB?style=flat-square&logo=react&logoColor=111" alt="React">
  <img src="https://img.shields.io/badge/Vite-7.x-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Bootstrap-5.x-7952B3?style=flat-square&logo=bootstrap&logoColor=white" alt="Bootstrap">
  <img src="https://img.shields.io/badge/Heroicons-2.x-8B5CF6?style=flat-square" alt="Heroicons">
</p>

A lightweight desktop application for managing academic directory records — Students, Programs, and Colleges — powered by React + Tauri.

<div align="center">

![App Demo](docs/demo.png)

</div>

---

## 📋 Overview

Acadex is a desktop app built with React, Vite, and Tauri with a Bootstrap 5 UI. It provides full CRUD operations across three linked directories with fast, searchable, and sortable tables.

---

## 🧾 Data Model

### 👤 Students

| Column | Type | Constraints | Description |
|---|---|---|---|
| `ID` | String | Primary Key, Required | Unique student identifier |
| `First Name` | String | Required | Student's first name |
| `Last Name` | String | Required | Student's last name |
| `Program Code` | String | FK → Programs.Code, nullable (`NULL`) | Enrolled program |
| `Year` | String | Required | Year level (e.g., `1`, `2`, `3`, `4`) |
| `Gender` | String | Required | Gender (e.g., `Male`, `Female`) |

---

### 📄 Programs

| Column | Type | Constraints | Description |
|---|---|---|---|
| `Code` | String | Primary Key, Required | Unique program code (e.g., `BSCS`) |
| `Name` | String | Required | Full program name |
| `College` | String | FK → Colleges.Code, nullable (`NULL`) | Parent college |

---

### 🏛️ Colleges

| Column | Type | Constraints | Description |
|---|---|---|---|
| `Code` | String | Primary Key, Required | Unique college code (e.g., `CCS`) |
| `Name` | String | Required | Full college name |

---

## 🚀 Getting Started

### ✅ Prerequisites

| Requirement | Notes |
|---|---|
| [Node.js](https://nodejs.org/) 18+ | Required for the frontend and Tauri CLI |
| [Rust](https://www.rust-lang.org/tools/install) | Required to build and run the Tauri backend |
| [Tauri prerequisites](https://tauri.app/start/prerequisites/) | Install OS-level dependencies for your platform |

### ▶️ Run in Development

```bash
# Clone the repository
git clone <repo-url>
cd acadexv2

# Install dependencies
npm install

# Start the Tauri app in development mode
npm run tauri dev
```

The app window will open automatically.

### 📦 Build for Production

```bash
# Build the desktop app for the current platform
npm run tauri build
```

For platform-specific packaging details, refer to the [Tauri build documentation](https://tauri.app/distribute/).