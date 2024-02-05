import { Pago } from '../entities/pago.entity';

export interface PagoResponse {
   pago: Pago,
   message: string;
}