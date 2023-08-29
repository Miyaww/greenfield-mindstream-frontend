import React from 'react';
import { IReturnOffChainAuthKeyPairAndUpload } from '@bnb-chain/greenfield-js-sdk';

type OffChain = IReturnOffChainAuthKeyPairAndUpload;

export const initialState = {
  offchain: Array<OffChain>,
  isAuthPending: false,
  onOffChainAuth: () => {
    // void
  },
};

export interface OffchainState {
  offchainState: {
    offchain: OffChain[];
    isAuthPending: boolean;
    onOffChainAuth: (args?: any) => void;
  };
  offchainDispatch: React.Dispatch<any>;
}

export const OffChainAuthContext = React.createContext<OffchainState>(
  null as any,
);
OffChainAuthContext.displayName = 'OffChainAuthContext';

export const OffChainAuthReducer = (initialState: any, action: any) => {
  switch (action.type) {
    case 'SET_OFFCHAIN_DATA':
      return {
        ...initialState,
        offchain: action.offchain,
      };
    default:
      return initialState;
  }
};

export * from './Provider';
