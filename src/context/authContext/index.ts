import React, { createContext } from 'react';

export const initialState = {
  status: 0,
  isStatusPending: false,
};

export interface AuthState {
  authState: {
    status: number;
    isStatusPending: boolean;
  };
  authDispatch: React.Dispatch<any>;
}
export const AuthContext = createContext<AuthState>(null as any);
AuthContext.displayName = 'AuthContext';

export const AuthReducer = (initialState: any, action: any) => {
  switch (action.type) {
    case 'UPDATE_STATUS':
      return { ...initialState, status: action.status };
    default:
      return initialState;
  }
};

export * from './Provider';
