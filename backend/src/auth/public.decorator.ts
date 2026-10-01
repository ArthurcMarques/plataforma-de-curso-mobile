// Marca endpoints que dispensam autenticação; os guards consultam esse metadado.
import { SetMetadata } from '@nestjs/common';
export const PUBLIC_ROUTE = 'publicRoute';
export const Public = () => SetMetadata(PUBLIC_ROUTE, true);
