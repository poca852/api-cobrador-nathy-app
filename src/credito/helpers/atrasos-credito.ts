import * as moment from 'moment';
import { Credito } from "../entities/credito.entity";
import { Pago } from 'src/pago/entities/pago.entity';

export class CalculadorDeAtrasos {

    private credito: Credito;
    private fechaActual: moment.Moment;

    constructor(credito: Credito, fecha: string) {
        this.credito = credito;
        this.fechaActual = moment(fecha);
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
        const atrasosMaximos = this.calcularAtrasosMaximos();

        return Math.min(atrasos, atrasosMaximos);
        // return atrasos;
    }

    getMessage(): string {

      let cuotasPendientes = this.credito.saldo / this.credito.valor_cuota;
      let aplicandoFixed = cuotasPendientes.toFixed(2);

      let cuotasPendientesParse = Number(aplicandoFixed);
  
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

      return txtMessage
    }
}