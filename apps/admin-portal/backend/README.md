# LocQar Backend — IoT Locker Management System

This is the backend service for the LocQar project, a smart parcel locker system. It manages lockers, packages, and real-time IoT communication with locker hardware.

## 🚀 Quick Start

### 1. Prerequisites
- Node.js (v20+)
- npm

### 2. Installation
```bash
# Install dependencies
npm install

# Sync database (SQLite)
npx prisma db push
```

### 3. Run the Server
```bash
# Development mode
npm run start:dev

# Production build & run
npm run build
node dist/main.js
```

The backend runs on **port 3000**.
The MQTT Broker runs on **port 1883** (with auto-retry logic).

---

## 🛠 Tech Stack
- **Framework:** [NestJS](https://nestjs.com/)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Database:** SQLite (local development)
- **IoT Protocol:** MQTT (via [Aedes](https://github.com/moscajs/aedes) embedded broker)

---

## 📡 IoT & Locker Simulation

This system includes an embedded MQTT broker. You can test the end-to-end flow using the virtual locker simulator.

### Running the Simulator
In a separate terminal:
```bash
node scripts/virtual-locker.js
```
The simulator connects to the broker, subscribes to commands, and publishes status updates (e.g., door opened/closed).

---

## 📖 Documentation
Detailed documentation is available in the [`/docs`](./docs) folder:
- [IoT Architecture](./docs/iot-architecture.md) — Topics and payload formats.
- [API Reference](./docs/api.md) — REST endpoints and DTOs.

---

## 🗄 Database Schema
Run `npx prisma studio` to visualize the database. Key models include:
- `Terminal`: A physical location with multiple lockers.
- `Locker`: Individual compartments within a terminal.
- `Package`: Parcel assigned to a specific locker.
- `User`: Admin/Agent accounts.
