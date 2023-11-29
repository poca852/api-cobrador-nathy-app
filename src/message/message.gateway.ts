import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { MessageService } from './message.service';
import { Socket, Server } from 'socket.io';

@WebSocketGateway({cors: true})
export class MessageGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() wss: Server;

  constructor(
    private readonly messageService: MessageService,
  ) {}

  async handleConnection(client: Socket) {
    
    this.wss.emit('mensaje', {
      name: 'david cuspoca'
    })

  }
  
  handleDisconnect(client: Socket) {
  }


  @SubscribeMessage('close-ruta')
  async handleCoseRuta( client: Socket, paylaod: { ruta: string }){
    


  }

}
