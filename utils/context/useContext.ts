import { A2RContext } from '../../model/context';

import { getContext } from '.';

const useContext = (): A2RContext => {
  const context = getContext();
  if (context === null) {
    throw Error(`Something's wrong, context has not been defined`);
  }
  if (context === false) {
    throw Error('Something went wrong, make sure "useContext" is the first line on method');
  }
  return context;
}

export default useContext;
