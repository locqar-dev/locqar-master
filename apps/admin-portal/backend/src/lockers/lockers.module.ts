import { Module } from '@nestjs/common';
import { LockersService } from './lockers.service';
import { LockersController } from './lockers.controller';
import { MqttModule } from '../mqtt/mqtt.module';
import { MqttService } from '../mqtt/mqtt.service';

@Module({
  imports: [MqttModule],
  controllers: [LockersController],
  providers: [LockersService, MqttService],
})
export class LockersModule { }
