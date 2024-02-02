import * as moment from 'moment';
import { Credito } from "../entities/credito.entity";
import { Pago } from 'src/pago/entities/pago.entity';

export class CalculadorDeAtrasos {

    private credito: Credito;
    private fechaActual: moment.Moment;

    constructor(credito: Credito) {
        this.credito = credito;
        this.fechaActual = moment();
    }

    public getLastPay(): Pago {

      return this.credito.pagos[0];

   }

    private calcularDiasEfectivosPago(): number {
        let diasEfectivosPago = this.fechaActual.diff(moment(this.credito.fecha_inicio, 'DD/MM/YYYY'), 'days');
        
        if (!this.credito.se_cobran_domingos) {
          let fecha = moment(this.credito.fecha_inicio, 'DD/MM/YYYY');
          for (let i = 0; i <= diasEfectivosPago; i++) {
            if (fecha.day() === 0) {
              diasEfectivosPago--;
            }
            fecha.add(1, 'day');
          }
        }
        
        return diasEfectivosPago;
      }

    private calcularIntervaloPagos(): number {
        return this.credito.frecuencia_cobro === 'semanal' ? 7 : 1;
    }

    private calcularAtrasosMaximos(): number {
        return (this.credito.total_cuotas - 1) * this.calcularIntervaloPagos();
    }

    public calcularAtrasos(): number {
        const diasEfectivosPago = this.calcularDiasEfectivosPago();
        const pagosRealizados = Math.floor(this.credito.abonos / this.credito.valor_cuota);
        const atrasos = diasEfectivosPago - pagosRealizados;
        // const atrasosMaximos = this.calcularAtrasosMaximos();

        // return Math.min(atrasos, atrasosMaximos);
        return atrasos;
    }

    getMessage(): { message: string; urlMessage: string } {

      let cuotasPendientes = this.credito.saldo / this.credito.valor_cuota;
      let aplicandoFixed = cuotasPendientes.toFixed(2);

      let cuotasPendientesParse = Number(aplicandoFixed);

      let txtEncoded: string = `
         Fecha+Inicio%3a+${this.credito.fecha_inicio.replaceAll(" ", "+")}%0d%0a
         Cliente%3a+${this.credito.cliente.alias.replaceAll(" ", "+")}%0d%0a
         Abonos%3a+$${this.credito.abonos}.00%0d%0a
         Saldo%3a+$${this.credito.saldo}.00%0d%0a
         Atrasos%3a+${this.calcularAtrasos()}%0d%0a
         Cuotas+pendientes%3a+${cuotasPendientesParse}+/+${this.credito.total_cuotas}.00%0d%0a%0d%0a
         Informacion+ultimo+pago%3a+%0d%0a
         Valor%3a+$${this.getLastPay().valor}.00%0d%0a
         Fecha%3a+${this.getLastPay().fecha.replaceAll(" ", "+")}
      `

      let txtMessage: string = `
         Fecha: ${this.credito.fecha_inicio} 
         Cliente: ${this.credito.cliente.alias} 
         Abonos: $${this.credito.abonos}.00 
         Saldo: $${this.credito.saldo}.00 
         Atrasos: ${this.calcularAtrasos()} 
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