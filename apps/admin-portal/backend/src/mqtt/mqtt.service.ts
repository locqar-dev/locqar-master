import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import * as net from 'net';

@Injectable()
export class MqttService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(MqttService.name);
    private aedes: any;
    private server: net.Server;
    private port = 1883;

    onModuleInit() {
        // aedes is an ESM package — the constructor is at require('aedes').Aedes
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { Aedes } = require('aedes');

        this.aedes = new Aedes();

        // Use Node's built-in net module for raw TCP (standard MQTT transport)
        this.server = net.createServer(this.aedes.handle.bind(this.aedes));

        this.server.on('error', (err: NodeJS.ErrnoException) => {
            if (err.code === 'EADDRINUSE') {
                this.logger.warn(`Port ${this.port} in use, retrying on ${this.port + 1}...`);
                this.port += 1;
                setTimeout(() => this.server.listen(this.port, '0.0.0.0'), 200);
            } else {
                this.logger.error(`❌ MQTT Server Error: ${err.message}`);
            }
        });

        this.server.listen(this.port, '0.0.0.0', () => {
            this.logger.log(`✅ MQTT Broker running on port ${this.port}`);
        });

        this.aedes.on('client', (client: any) => {
            this.logger.log(`📡 Client Connected: ${client?.id}`);
        });

        this.aedes.on('clientDisconnect', (client: any) => {
            this.logger.log(`📴 Client Disconnected: ${client?.id}`);
        });

        this.aedes.on('publish', (packet: any, client: any) => {
            if (client && !packet.topic.startsWith('$SYS')) {
                this.logger.verbose(`📨 [${client.id}] ${packet.topic} → ${packet.payload.toString()}`);
            }
        });
    }

    onModuleDestroy() {
        this.server?.close();
        this.aedes?.close();
    }

    getPort(): number {
        return this.port;
    }

    publish(topic: string, payload: string) {
        if (!this.aedes) return;
        this.aedes.publish(
            { topic, payload: Buffer.from(payload), cmd: 'publish', qos: 0, dup: false, retain: false },
            (err: any) => {
                if (err) this.logger.error(`Failed to publish to ${topic}`, err);
            },
        );
    }
}
