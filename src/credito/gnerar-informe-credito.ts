import { Credito } from './entities/credito.entity';
import { Pago } from '../pago/entities/pago.entity';
import { addDays, differenceInDays, getDay } from 'date-fns';
export class InformeCredito {

   private credito: Credito;

   constructor( credito: Credito ){
      this.credito = credito;
   }

   public getLastPay(): Pago {

      return this.credito.pagos[0];

   }

   public async calcularAtrasos() {
      let q = this.credito.fecha_inicio.split('/')
      let newFecha = `${q[2]}-${q[1]}-${q[0]}`;
  
      const fechaInicioCredito = new Date(newFecha);
  
      const fechaInicioPagos = addDays(fechaInicioCredito, 1);
      
      const fechaActual = new Date();
    
      const totalDias = differenceInDays(fechaActual, fechaInicioPagos);
    
      let diasEfectivosPago = totalDias;
      let fecha = fechaInicioPagos;
      for (let i = 0; i < totalDias; i++) {
        if (getDay(fecha) === 0) {
          diasEfectivosPago--;
        }
        fecha = addDays(fecha, 1);
      }
    
      const valorCuota = this.credito.valor_cuota;
      const totalAbonos = this.credito.abonos;
    
      const pagosRealizados = Math.floor(totalAbonos / valorCuota);
      const pagosRequeridos = this.credito.total_cuotas;
    
      const atrasos = Math.max(diasEfectivosPago - pagosRealizados, 0);
      const atrasosMaximos = (pagosRequeridos - 1) * 1; // Restamos 1 para representar el día en que se dio el crédito
    
      return Math.min(atrasos, atrasosMaximos);
    }

   async getMessage(): Promise<{message: string; urlMessage: string}> {

      let cuotasPendientes = this.credito.saldo / this.credito.valor_cuota;
      let aplicandoFixed = cuotasPendientes.toFixed(2);

      let cuotasPendientesParse = Number(aplicandoFixed);

      let txtEncoded: string =  `
         Fecha+Inicio%3a+${this.credito.fecha_inicio.replaceAll(" ", "+")}%0d%0a
         Cliente%3a+${this.credito.cliente.alias}%0d%0a
         Abonos%3a+$${this.credito.abonos}.00%0d%0a
         Atrasos%3a+${await this.calcularAtrasos()}%0d%0a
         Cuotas+pendientes%3a+${cuotasPendientesParse}+/+${this.credito.total_cuotas}.00%0d%0a%0d%0a
         Informacion+ultimo+pago%3a+%0d%0a%0d%0a
         Valor%3a+$${this.getLastPay().valor}.00%0d%0a
         Fecha%3a+${this.getLastPay().fecha.replaceAll(" ", "+")}
      `

      let txtMessage: string = `
         Fecha: ${this.credito.fecha_inicio} 
         Cliente: ${this.credito.cliente.alias} 
         Abonos: $${this.credito.abonos}.00 
         Atrasos: ${await this.calcularAtrasos()} 
         Cuotas Pendientes: ${cuotasPendientesParse} / ${this.credito.total_cuotas}  
         Informacion Ultimo Pago 
         Valor: $${this.getLastPay().valor}.00  
         Fecha: ${this.getLastPay().fecha}
      `

      return {
         urlMessage: `https://wa.me/${this.credito.cliente.telefono}?text=${txtEncoded}`,
         message: txtMessage
      }

   }

}