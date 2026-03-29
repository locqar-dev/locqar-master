const mqtt = require('mqtt');

// Configuration
const BROKER_URL = 'mqtt://127.0.0.1:1884';
const TERMINAL_ID = 'T-01';
const LOCKER_ID = 'A-01';

// Connect to the broker
const client = mqtt.connect(BROKER_URL, {
    clientId: `locker-${TERMINAL_ID}-${LOCKER_ID}`,
});

const commandTopic = `locker/${TERMINAL_ID}/${LOCKER_ID}/command`;
const statusTopic = `locker/${TERMINAL_ID}/${LOCKER_ID}/status`;

client.on('connect', () => {
    console.log(`[${LOCKER_ID}] ✅ Connected to broker at ${BROKER_URL}`);

    client.subscribe(commandTopic, (err) => {
        if (!err) {
            console.log(`[${LOCKER_ID}] 🔔 Subscribed to ${commandTopic}`);
        }
    });
});

client.on('message', (topic, message) => {
    if (topic === commandTopic) {
        const payload = JSON.parse(message.toString());
        console.log(`[${LOCKER_ID}] 📩 Command received:`, payload);

        if (payload.action === 'OPEN') {
            console.log(`[${LOCKER_ID}] 🔓 Opening door...`);
            client.publish(statusTopic, JSON.stringify({ status: 'OCCUPIED', door: 'OPEN' }));
            setTimeout(() => {
                console.log(`[${LOCKER_ID}] 🔒 Door closed.`);
                client.publish(statusTopic, JSON.stringify({ status: 'AVAILABLE', door: 'CLOSED' }));
            }, 3000);
        }
    }
});

client.on('error', (err) => {
    console.error(`[${LOCKER_ID}] ❌ Error:`, err.message);
});
