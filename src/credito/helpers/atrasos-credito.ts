import { addDays, differenceInDays, getDay } from "date-fns";
import { Credito } from "../entities/credito.entity";

export const calcularAtrasos = async (credito: Credito) => {
   // const credito = await this.creditoModel.findById(idCredito);
   let q = credito.fecha_inicio.split('/');

   let newFecha = `${q[2]}-${q[1]}-${q[0]}`;


   const fechaInicioCredito = new Date(newFecha);

   let fechaInicioPagos = addDays(fechaInicioCredito, 1);

   const fechaActual = new Date();

   const totalDias = differenceInDays(fechaActual, fechaInicioPagos);

   
   const diasEfectivosPago = calcularDiasEfectivosPago(fechaInicioPagos, fechaActual, credito.se_cobran_domingos);
   
   const intervaloPagos = calcularIntervaloPagos(credito.frecuencia_cobro);

   const valorCuota = credito.valor_cuota;
   const totalAbonos = credito.abonos;

   const pagosRealizados = Math.floor(totalAbonos / valorCuota);
   const pagosRequeridos = credito.total_cuotas;

   const atrasos = Math.max(diasEfectivosPago - pagosRealizados, 0);
   const atrasosMaximos = calcularAtrasosMaximos(pagosRequeridos, intervaloPagos);

   return Math.min(atrasos, atrasosMaximos);
 }

 export const calcularDiasEfectivosPago = (fechaInicioPagos: Date, fechaActual: Date, seCobranDomingos: boolean) => {

   let diasEfectivosPago = differenceInDays(fechaActual, fechaInicioPagos);

   if (!seCobranDomingos) {

     let fecha = fechaInicioPagos;

     for (let i = 0; i <= diasEfectivosPago; i++) {

       if (getDay(fecha) === 0) {
         diasEfectivosPago--;
       }
       fecha = addDays(fecha, 1);


     }

   }
 
   return diasEfectivosPago;
 }

 export const calcularIntervaloPagos = (frecuenciaCobro: string): number  => {
   if (frecuenciaCobro === 'semanal') {
     return 7;
   } else {
     return 1;
   }
 }

 export const calcularAtrasosMaximos = (pagosRequeridos: number, intervaloPagos: number): number => {
   return (pagosRequeridos - 1) * intervaloPagos;
 }