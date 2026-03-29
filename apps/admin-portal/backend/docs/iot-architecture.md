# IoT Architecture & MQTT Protocol

LocQar uses MQTT for real-time communication between the backend server and the physical locker hardware (or the virtual simulator).

## 🛰 Broker Configuration
- **Host:** `localhost` (Internal), `127.0.0.1` (External for simulator)
- **Port:** `1883` (Standard)
  - *Note: In development mode, if port 1883 is occupied by a ghost process, the server will automatically retry on 1884, 1885, etc.*

## 📌 Topic Structure
Topics are structured as: `locker/{terminalId}/{lockerId}/{action}`

### 1. Commands (Outbound from Server)
**Topic:** `locker/{terminalId}/{lockerId}/command`

**Action: OPEN**
- **Payload:** `{"action": "OPEN"}`
- **Description:** Triggers the physical solenoid lock to release the door.

---

### 2. Status Updates (Inbound from Hardware)
**Topic:** `locker/{terminalId}/{lockerId}/status`

**Payload Format:**
```json
{
  "status": "OCCUPIED" | "AVAILABLE" | "MAINTENANCE",
  "door": "OPEN" | "CLOSED",
  "battery": 85,
  "temp": 24.5
}
```

---

## 🔄 Flow Example: Remote Opening
1. Admin clicks "Open Door" in the Admin Portal.
2. Frontend calls `POST /lockers/:id/open`.
3. `LockersService` publishes `{"action": "OPEN"}` to `locker/T-01/A-01/command`.
4. Hardware (or Simulator) receives the message.
5. Hardware triggers the lock and publishes a status update back to `locker/T-01/A-01/status` with `{"door": "OPEN"}`.
6. Server receives the status update and updates the database via `LockersService`.
