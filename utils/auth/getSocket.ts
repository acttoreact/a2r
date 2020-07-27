import io from 'socket.io-client';

import isClient from '../../tools/isClient';
import { getSettings } from '../settings';

let socket: SocketIOClient.Socket | null = null;

const getSocket = async (): Promise<SocketIOClient.Socket> => {
  if (!socket) {
    const settings = await getSettings();
    socket = io(settings.devServer.url, {
      autoConnect: isClient(),
      path: '/ws',
    });
  }
  return socket;
};

export default getSocket;
