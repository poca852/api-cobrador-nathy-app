import { Credito } from "../entities/credito.entity";

export const getAbonos = (credito: Credito): number => {

   let abonos: number = 0;

   credito.pagos.forEach(pago => {
     abonos += pago.valor;
   })

   return abonos;

 }