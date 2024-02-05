import { Credito } from "../entities/credito.entity";

export const getSaldo = (credito: Credito): number => {
  const abonos = credito.pagos.reduce((totalAbonos, pago) => totalAbonos + pago.valor, 0);
  return credito.total_pagar - abonos;
};