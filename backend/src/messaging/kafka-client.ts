import { Kafka } from 'kafkajs';

// Única fábrica do client Kafka: producer e consumer usam exatamente a mesma configuração.
export function createKafkaClient() {
  return new Kafka({
    clientId: 'plataforma-cursos-api',
    brokers: (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(','),
    retry: { retries: 8, initialRetryTime: 300 },
  });
}
