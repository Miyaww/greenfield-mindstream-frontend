import Web3 from 'web3';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { OwnBuyContract } from '../base/contract/ownBuyContract';

import { useModal } from './useModal';

export const useGetApproved = () => {
  const modalData = useModal();

  const { address } = useAccount();
  const [hasRole, setHasRole] = useState(false);
  const [loading, setLoading] = useState(true);

  const { activeGroup } = modalData.modalState;
  const { groupId } = activeGroup;

  useEffect(() => {
    if (address && groupId) {
      OwnBuyContract(false)
        .methods.getApproved(Number(groupId))
        .call({ from: address })
        .then((result: any) => {
          setHasRole(!!result);
          setLoading(false);
        })
        .catch((err: any) => {
          console.log(err);
          setLoading(false);
        });
    }
  }, [address, groupId]);

  return { hasRole, setHasRole, loading };
};
