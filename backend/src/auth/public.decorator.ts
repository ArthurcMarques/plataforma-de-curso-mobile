// Marca endpoints que dispensam autenticação; os guards consultam esse metadado.
import { SetMetadata } from '@nestjs/common';
export const PUBLIC_ROUTE = 'publicRoute';
export const Public = () => SetMetadata(PUBLIC_ROUTE, true);

// Aceita ausência de credenciais, mas valida qualquer Authorization enviado.
export const OPTIONAL_AUTH = 'optionalAuth';
export const OptionalAuth = () => SetMetadata(OPTIONAL_AUTH, true);
