import { A2RUserTokenInfo } from './auth';

export interface A2RContext {
  sessionId: string;
  userInfo?: A2RUserTokenInfo;
}

export type CurrentContext = A2RContext | false | null;