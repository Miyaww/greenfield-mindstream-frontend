// import { useCallback, useState, useEffect } from 'react';
// import { useGetChainProviders } from './useGetChainProviders';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { MindStreamContract } from '../base/contract/mindStreamContract';

export const useSalesVolume = (groupId: string) => {
  const { address } = useAccount();
  const [salesVolume, setSalesVolume] = useState(0);

  useEffect(() => {
    if (groupId) {
      MindStreamContract(false)
        .methods.salesVolume(groupId)
        .call({ from: address })
        .then((result: any) => {
          setSalesVolume(result);
        });
    }
  }, [address, groupId]);
  return { useSalesVolume, salesVolume };
};
