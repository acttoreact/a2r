import { A2RContext, CurrentContext } from '../../model/context';

let context : CurrentContext = null;

/**
 * Sets context for next API method to be executed
 * @param currentContext Context for current API method
 */
export const setContext = (currentContext: A2RContext | false): void => {
  context = currentContext;
};

/**
 * Gets current context
 */
export const getContext = (): CurrentContext => context;
