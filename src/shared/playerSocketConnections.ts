import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class playerSocketConnections {
  private readonly servers: Map<string, Socket> = new Map();

  public setSocket(user: string, userSocket: Socket): void {
    this.servers.set(user, userSocket);

  }

  public getSocket(user: string) {
    console.log('='.repeat(50));
    console.log('GET SOCKET');
    console.log('='.repeat(50));
    console.log('userId',user);
    console.log([...this.servers.keys()]);
    return this.servers.get(user);
  }
}
