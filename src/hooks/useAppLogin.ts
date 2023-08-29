import { GF_CHAIN_ID } from '../env';
import { useAccount, useNetwork } from 'wagmi';
import { useAsyncEffect } from 'ahooks';
import { useCallback, useState } from 'react';
import {
  ModalBody,
  Text,
  toast,
  useDisclosure,
  Modal,
  Button,
} from '@totejs/uikit';

import { useOffChainAuth } from '../hooks/useOffChainAuth';
import { getOffchainAuthKeys } from '../utils/off-chain-auth';

export function useAppLogin(address?: string) {
  const { chain } = useNetwork();
  const { isConnected } = useAccount();
  const { offchainDispatch } = useOffChainAuth();
  const [isAuthPending, setIsAuthPending] = useState(false);
  const { connector } = useAccount();

  const onOffChainAuth = useCallback(
    async (address: any) => {
      setIsAuthPending(true);
      try {
        const provider = await connector?.getProvider();
        const res = await getOffchainAuthKeys(address, provider);
        console.log(res, 'getOffchainAuthKeys');
        offchainDispatch({
          type: 'SET_OFFCHAIN_DATA',
          payload: res,
        });
        setIsAuthPending(false);
        // onClose();

        return { code: 0, message: 'success' };
      } catch (e: any) {
        console.log('gen offChain data error', e);
        const { message } = e;
        message && toast.error({ description: `${message}`, duration: 3000 });
        setIsAuthPending(false);
        // onClose();
        return { code: -1, error: e };
      }
    },
    [connector],
  );

  useAsyncEffect(async () => {
    if (isConnected && chain?.id === GF_CHAIN_ID && address) {
      // onOffChainAuth(address);
    }
  }, [address, chain?.id, isConnected, onOffChainAuth]);

  return { isAuthPending };
}
