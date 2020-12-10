import { log } from "./colors";
import { stop } from './docker';

const onProcessExit = async (dockerName: string): Promise<void> => {
  log(`On exit, stopping docker: ${dockerName}`);
  await stop(dockerName);
  log('Docker stopped');
};

export default onProcessExit;
