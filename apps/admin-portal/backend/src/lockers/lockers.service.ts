import { Injectable } from '@nestjs/common';
import { CreateLockerDto } from './dto/create-locker.dto';
import { UpdateLockerDto } from './dto/update-locker.dto';
import { PrismaService } from '../prisma/prisma.service';
import { MqttService } from '../mqtt/mqtt.service';

@Injectable()
export class LockersService {
  constructor(
    private prisma: PrismaService,
    private mqttService: MqttService
  ) { }

  create(createLockerDto: CreateLockerDto) {
    return this.prisma.locker.create({
      data: {
        displayId: createLockerDto.displayId || 'UNKNOWN',
        terminalId: createLockerDto.terminalId,
        doorNumber: createLockerDto.doorNumber || 1,
        size: createLockerDto.size || 'MEDIUM',
        status: 'AVAILABLE'
      }
    });
  }

  findAll() {
    return this.prisma.locker.findMany({ include: { terminal: true } });
  }

  findOne(id: string) {
    return this.prisma.locker.findUnique({ where: { id }, include: { terminal: true } });
  }

  update(id: string, updateLockerDto: UpdateLockerDto) {
    return this.prisma.locker.update({
      where: { id },
      data: updateLockerDto,
    });
  }

  remove(id: string) {
    return this.prisma.locker.delete({ where: { id } });
  }

  async openLocker(id: string) {
    const locker = await this.findOne(id);
    if (!locker) throw new Error('Locker not found');

    // MOCK: Publish MQTT command to open locker
    // Topic: locker/{terminalId}/{lockerId}/command
    const topic = `locker/${locker.terminalId}/${locker.displayId}/command`;
    const payload = JSON.stringify({ action: 'OPEN', timestamp: Date.now() });

    this.mqttService.publish(topic, payload);

    return { status: 'COMMAND_SENT', topic };
  }
}
