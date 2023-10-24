import { useCallback } from 'react';
import { useAccount } from 'wagmi';
import { OwnBuyContract } from '../base/contract/ownBuyContract';
import { BSC_SEND_GAS_FEE, MINDSTREAM_CONTRACT_ADDRESS } from '../env';

export const useApprove = () => {
  const { address } = useAccount();

  const Approve = useCallback(
    async (tokenId: string) => {
      if (!address || !tokenId) return Promise.reject(false);
      return new Promise((res, rej) => {
        OwnBuyContract()
          .methods.approve(MINDSTREAM_CONTRACT_ADDRESS, Number(tokenId))
          .send({ from: address, gasPrice: BSC_SEND_GAS_FEE })
          .then((result: any) => {
            res(result);
          })
          .catch((err: any) => {
            rej(err);
          });
      });
    },
    [address],
  );

  return {
    Approve,
  };
};
