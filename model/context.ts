export interface A2RContext {
  sessionId: string;
}

export type CurrentContext = A2RContext | false | null;