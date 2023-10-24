import React, { ReactNode, useReducer } from 'react';

import { AuthReducer, AuthContext, initialState } from '.';

interface authProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.ComponentType<authProviderProps> = (
  props: authProviderProps,
) => {
  const { children } = props;
  const [authState, authDispatch] = useReducer(AuthReducer, initialState);

  return (
    <AuthContext.Provider
      value={{
        authState: authState,
        authDispatch: authDispatch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
AuthProvider.displayName = 'AuthProvider';
