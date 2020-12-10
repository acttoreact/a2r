import { io, Socket } from 'socket.io-client';

import isClient from '../../tools/isClient';
import { getSettings } from '../devSettings';

let socket: Socket | null = null;

const getSocket = async (): Promise<Socket> => {
  if (!socket) {
    const settings = await getSettings();
    socket = io(`localhost:${settings.server.port}`, {
      autoConnect: isClient(),
      path: '/ws',
    });
  }
  return socket;
};

export default getSocket;
