import { join, normalize, resolve } from 'path';
import{ createServer } from 'http';
import isDev from 'electron-is-dev';
import { app, protocol } from 'electron';
import next from 'next';

const adjustRenderer = (directory: string) => {
  const paths = ['/_next', '/static'];
  const isWindows = process.platform === 'win32';

  protocol.interceptFileProtocol('file', (request, callback) => {
    let path = request.url.substr(isWindows ? 8 : 7);

    console.log('original path', path);

    for (const prefix of paths) {
      let newPath = path;

      // On windows the request looks like: file:///C:/static/bar
      // On other systems it's file:///static/bar
      if (isWindows) {
        newPath = newPath.substr(2);
      }

      if (!newPath.startsWith(prefix)) {
        continue;
      }

      // Strip volume name from path on Windows
      if (isWindows) {
        newPath = normalize(newPath);
      }

      newPath = join(directory, newPath);
      path = newPath;
    }

    // Electron doesn't like anything in the path to be encoded,
    // so we need to undo that. This specifically allows for
    // Electron apps with spaces in their app names.
    path = decodeURIComponent(path);

    console.log('final path', path);

    callback({ path });
  })
}

const prepareServer = async (dir: string, port?: number): Promise<void> => {
  // We need to load it here because the app's production
  // bundle shouldn't include it, which would result
  // in an error
  const appPath = resolve(__dirname, '..', dir);
  const nextApp = next({ dev: isDev, dir: appPath });
  const requestHandler = nextApp.getRequestHandler();

  // Build the renderer code and watch the files
  await nextApp.prepare();

  // But if developing the application, create a
  // new native HTTP server (which supports hot code reloading)
  const server = createServer(requestHandler);

  const serverPort = port || 8000;
  server.listen(serverPort, () => {
    // Make sure to stop the server when the app closes
    // Otherwise it keeps running on its own
    app.on('before-quit', () => server.close());
  });
};

const prepareNext = async (dir: string, port?: number): Promise<void> => {
  if (!isDev) {
    adjustRenderer(dir);
  }

  await prepareServer(dir, port);
};

export default prepareNext;