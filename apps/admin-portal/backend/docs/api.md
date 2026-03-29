# API Reference

The LocQar backend provides a RESTful API for management of lockers, terminals, and packages.

**Base URL:** `http://localhost:3000`

---

## 📦 Packages
Endpoints for managing parcels and locker assignments.

### Get All Packages
- **URL:** `/packages`
- **Method:** `GET`
- **Response:** `200 OK` (Array of Package objects)

### Get Package by ID
- **URL:** `/packages/:id`
- **Method:** `GET`

### Create Package
- **URL:** `/packages`
- **Method:** `POST`
- **Body:**
```json
{
  "waybill": "LQ-2024-00101",
  "customer": "Jane Smith",
  "phone": "+233...",
  "destination": "Accra Mall",
  "size": "Medium"
}
```

---

## 🔒 Lockers
Endpoints for locker state management and hardware triggers.

### List All Lockers
- **URL:** `/lockers`
- **Method:** `GET`

### Create Locker
- **URL:** `/lockers`
- **Method:** `POST`

### Remote Open Door
- **URL:** `/lockers/:id/open`
- **Method:** `POST`
- **Description:** Triggers an MQTT "OPEN" command to the physical locker hardware.
- **Response:** `201 Created`

---

## 📍 Terminals
*Note: Service implementation in progress.*

- **URL:** `/terminals`
- **Method:** `GET` | `POST`

---

## 🛠 Internal / System
- **Health Check:** `GET /` → returns "Hello World!"
