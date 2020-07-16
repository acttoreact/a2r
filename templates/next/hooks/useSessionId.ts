import { useContext } from 'react';
import { SessionContext } from '../pages/_app';

const useSessionId = (): string => useContext(SessionContext);

export default useSessionId;
