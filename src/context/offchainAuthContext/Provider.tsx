import { createContext, useCallback, useState, useReducer } from 'react';
import { OffChainAuthReducer, OffChainAuthContext, initialState } from '.';
import { useAccount } from 'wagmi';
import { ModalBody, Text, useDisclosure, Modal, Button } from '@totejs/uikit';

export const OffChainAuthProvider: React.FC<any> = ({ children }) => {
  const [isAuthPending, setIsAuthPending] = useState(false);
  const { isOpen, onClose, onOpen } = useDisclosure();

  const [offchainState, offchainDispatch] = useReducer(
    OffChainAuthReducer,
    initialState,
  );

  return (
    <OffChainAuthContext.Provider
      value={{
        offchainDispatch: offchainDispatch,
        offchainState: offchainState,
      }}
    >
      {children}
      <Modal
        isOpen={isOpen}
        overlayProps={{
          zIndex: 1,
        }}
        onClose={() => {
          //
        }}
      >
        <ModalBody mt={0} textAlign={'center'}>
          <Text
            fontSize={'24px'}
            lineHeight={'150%'}
            fontWeight={600}
            marginBottom={'16px'}
          >
            Authentication Expired
          </Text>
          <Text
            fontSize={'18px'}
            lineHeight={'22px'}
            fontWeight={400}
            color={'readable.tertiary'}
          >
            Please connect your wallet to authenticate again to continue.
          </Text>
          <Button
            width={'100%'}
            marginTop={'24px'}
            isLoading={isAuthPending}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            Authenticate Now
          </Button>
        </ModalBody>
      </Modal>
    </OffChainAuthContext.Provider>
  );
};
