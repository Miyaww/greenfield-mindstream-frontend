import { useContext } from 'react';

import { OffChainAuthContext } from '../context/offchainAuthContext';

export const useOffChainAuth = () => {
  const value = useContext(OffChainAuthContext);
  return value;
};
