import { Response } from 'express';

class SSEService {
  private clients: { id: string; res: Response }[] = [];

  addClient(clientId: string, res: Response) {
    this.clients.push({ id: clientId, res });

    // Handle connection close
    res.on('close', () => {
      this.removeClient(clientId);
    });
  }

  removeClient(clientId: string) {
    this.clients = this.clients.filter(client => client.id !== clientId);
  }

  broadcast(event: string, data: any) {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    this.clients.forEach(client => {
      client.res.write(payload);
    });
  }
}

export const sseService = new SSEService();
