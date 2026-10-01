// Resposta simples do endpoint raiz; não consulta os dados dos cursos.
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
