import { Credito } from "../entities/credito.entity";

export const getAbonos = (credito: Credito): number => {
  return credito.pagos.reduce((totalAbonos, pago) => totalAbonos + pago.valor, 0);
};