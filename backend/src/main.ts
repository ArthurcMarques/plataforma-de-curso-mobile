// Inicializa a API, a validação dos DTOs e a documentação Swagger; a porta pode ser configurada pelo ambiente.
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('User CRUD API')
    .setDescription('Documentação da API com NestJS, Prisma e JWT')
    .setVersion('1.0')
    .addTag('usuario')
    .addTag('auth')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        in: 'header',
      },
      'token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  // Complementa a documentação de todas as operações sem substituir descrições específicas.
  for (const path of Object.values(document.paths)) {
    for (const method of ['get', 'post', 'patch', 'put', 'delete', 'head', 'options'] as const) {
      const operation = path[method];
      if (!operation) continue;
      const responses = operation.responses;
      responses['400'] ??= { description: 'Parâmetros ou dados de entrada inválidos; vínculo informado inexistente.' };
      responses['500'] ??= { description: 'Falha interna inesperada.' };
      responses['503'] ??= { description: 'Banco de dados indisponível.' };
      if ((operation.security?.length ?? 0) > 0) {
        responses['401'] ??= { description: 'Token ausente, inválido ou expirado.' };
        responses['403'] ??= { description: 'Usuário autenticado sem permissão para a operação ou registro.' };
      }
      if (operation.parameters?.some(param => 'in' in param && param.in === 'path')) {
        responses['404'] ??= { description: 'Registro solicitado não encontrado.' };
      }
      if (['post', 'patch', 'put', 'delete'].includes(method)) {
        responses['409'] ??= { description: 'Duplicidade, conflito de alteração ou vínculos que impedem exclusão.' };
      }
    }
  }
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}/api`);
}
bootstrap();
