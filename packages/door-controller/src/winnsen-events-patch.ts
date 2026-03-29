/**
 * PATCH: New event actions for winnsen.router.ts
 * ================================================
 * Add these cases to the switch(action) block in POST /api/winnsen/events
 * to enable local door control without Winnsen cloud.
 *
 * Prerequisites:
 *   1. Door controller service running on locker at http://127.0.0.1:9090
 *   2. Add to .env: DOOR_CONTROLLER_URL=http://127.0.0.1:9090
 *   3. Import at top of winnsen.router.ts:
 *      import { doorClient } from '@locqar/door-controller/client';
 */

// ── Add these imports at the top of winnsen.router.ts ──────────────────────
// import { doorClient } from '@locqar/door-controller/client';

// ── Add these cases inside the switch(action) block ────────────────────────

      // ── Local door open (replaces Winnsen cloud SetDoorOpen) ───────────
      case 'open-door': {
        const { doorNumber, lockerSN } = body;
        if (!doorNumber) {
          return res.status(400).json({ Status: 'Fail', Message: 'doorNumber required' });
        }

        // Call local door controller instead of Winnsen cloud
        const result = await doorClient.openDoor(Number(doorNumber));

        // Log the event
        const locker = lockerSN ? await lockerBySN(lockerSN) : null;
        if (locker) {
          await prisma.lockerEvent.create({
            data: {
              lockerId: locker.id,
              eventType: 'door_opened',
              triggeredBy: 'local',
              metadata: { doorNumber, station: result.station, lock: result.lock },
            },
          });
        }

        logger.info(`[Winnsen/local] open-door door=${doorNumber} success=${result.success}`);
        return res.json({
          Status: result.success ? 'Success' : 'Fail',
          Message: result.error || '',
          door: result.door,
        });
      }

      // ── Local door status (replaces Winnsen cloud GetTerminalInfo) ─────
      case 'door-status': {
        const { doorNumber: dn, lockerSN: sn } = body;

        if (dn) {
          // Single door query
          const result = await doorClient.getDoorStatus(Number(dn));
          return res.json({
            Status: result.success ? 'Success' : 'Fail',
            door: result.door,
            doorStatus: result.status,
          });
        }

        if (sn) {
          // All doors on a locker — need to know which stations this locker maps to
          const locker = await lockerBySN(sn);
          if (!locker) return res.json({ Status: 'Fail', Message: 'Locker not found' });

          // Assume station mapping from locker config (adjust based on your schema)
          const stations = (locker as any).stations || [1]; // default station 1
          const allDoors: Record<string, string> = {};

          for (const st of stations) {
            const result = await doorClient.getStationStatus(st);
            if (result.doors) {
              for (const [lock, status] of Object.entries(result.doors)) {
                const globalDoor = (st - 1) * 16 + Number(lock);
                allDoors[String(globalDoor)] = status as string;
              }
            }
          }

          return res.json({ Status: 'Success', doors: allDoors });
        }

        return res.status(400).json({ Status: 'Fail', Message: 'doorNumber or lockerSN required' });
      }

      // ── Verify pickup code + open door (full local flow) ───────────────
      case 'verify-pickup-code': {
        const { code, lockerSN: lsn } = body;
        if (!code) {
          return res.status(400).json({ Status: 'Fail', Message: 'code required' });
        }

        // Find package by pickup code
        const pkg = await prisma.package.findFirst({
          where: {
            pickupCode: code,
            status: 'delivered_to_locker',
          },
          select: {
            id: true,
            waybill: true,
            lockerDoorNo: true,
            lockerId: true,
          },
        });

        if (!pkg) {
          return res.status(401).json({ Status: 'Fail', Message: 'Invalid or expired code' });
        }

        if (!pkg.lockerDoorNo) {
          return res.status(400).json({ Status: 'Fail', Message: 'No door assigned to this package' });
        }

        // Open the door locally
        const openResult = await doorClient.openDoor(pkg.lockerDoorNo);

        if (!openResult.success) {
          logger.error(`[Winnsen/local] Failed to open door ${pkg.lockerDoorNo} for pickup code ${code}`);
          return res.status(500).json({ Status: 'Fail', Message: 'Door failed to open' });
        }

        logger.info(`[Winnsen/local] verify-pickup-code code=${code} waybill=${pkg.waybill} door=${pkg.lockerDoorNo} → OPEN`);

        return res.json({
          Status: 'Success',
          waybill: pkg.waybill,
          doorNumber: pkg.lockerDoorNo,
          message: 'Door opened. Please collect your package.',
        });
      }

      // ── Generate pickup code locally (replaces Winnsen cloud SetPinCode) ─
      case 'generate-pickup-code': {
        const { orderNumber: on } = body;
        if (!on) {
          return res.status(400).json({ Status: 'Fail', Message: 'orderNumber required' });
        }

        // Generate 6-digit code
        const pickupCode = String(Math.floor(100000 + Math.random() * 900000));

        // Save to package
        const updated = await prisma.package.updateMany({
          where: { waybill: on },
          data: { pickupCode },
        });

        if (updated.count === 0) {
          return res.status(404).json({ Status: 'Fail', Message: 'Order not found' });
        }

        // Get recipient phone for SMS
        const pkgForSms = await prisma.package.findFirst({
          where: { waybill: on },
          select: { recipientPhone: true },
        });

        // TODO: Send SMS via Hubtel here
        // await smsService.send(pkgForSms.recipientPhone, `Your LocQar pickup code is: ${pickupCode}`);

        logger.info(`[Winnsen/local] generate-pickup-code waybill=${on} code=${pickupCode}`);

        return res.json({
          Status: 'Success',
          pickupCode,
          orderNumber: on,
        });
      }
