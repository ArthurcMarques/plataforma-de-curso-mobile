// Agrupa producer e consumer Kafka; importar este módulo já inicia o consumer (Nest instancia providers de módulos importados).
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { KafkaProducerService } from './kafka-producer.service';
import { KafkaConsumerService } from './kafka-consumer.service';

@Module({
  imports: [PrismaModule],
  providers: [KafkaProducerService, KafkaConsumerService],
  exports: [KafkaProducerService],
})
export class MessagingModule {}
