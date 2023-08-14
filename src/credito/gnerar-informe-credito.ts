import { Credito } from './entities/credito.entity';
import { Pago } from '../pago/entities/pago.entity';
export class InformeCredito {

   private credito: Credito;

   constructor( credito: Credito ){
      this.credito = credito;
   }

   public getLastPay(): Pago {

      return this.credito.pagos[0];

   }

   getMessage(): {message: string; urlMessage: string} {

      let txtEncoded: string =  `
         *Fecha*%3a+${this.getLastPay().fecha}%0d%0a
         *Cliente*%3a+${this.credito.cliente.alias}%0d%0a
         *Abonos*%3a+$${this.credito.abonos}.00%0d%0a
         *saldo*%3a+$${this.credito.saldo}.00%0d%0a%0d%0a
         *Informacion+ultimo+pago*%3a+%0d%0a%0d%0a
         *Valor*%3a+$${this.getLastPay().valor}.00%0d%0a
         *Fecha*%3a+${this.getLastPay().fecha}
      `

      let txtMessage: string = `
         Fecha: ${this.getLastPay().fecha} 
         Cliente: ${this.credito.cliente.alias} 
         Abonos: ${this.credito.abonos} 
         Saldo: ${this.credito.saldo} 
         Informacion Ultimo Pago 
         Valor: ${this.getLastPay().valor} 
         Fecha: ${this.getLastPay().fecha}
      `

      return {
         urlMessage: `https://wa.me/${this.credito.cliente.telefono}?text=${txtEncoded}`,
         message: txtMessage
      }

   }

}