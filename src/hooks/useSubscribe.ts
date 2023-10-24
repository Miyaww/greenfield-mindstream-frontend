import { useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useStatus } from './useStatus';
import { useChainBalance } from './useChainBalance';
import { MindStreamContract } from '../base/contract/mindStreamContract';
import BN from 'bn.js';
import { useRelayFee } from './useRelayFee';
import { delay, divide10Exp } from '../utils';
import { useModal } from './useModal';
import { BSC_SEND_GAS_FEE } from '../env';
import { OwnContract } from '../base/contract/ownContract';

export const useSubscribe = (groupName: string, groupOwner: string) => {
  // 0 owner
  // 1 purchase
  // 2 Waiting for purchase
  const { address } = useAccount();
  const { BscBalanceVal } = useChainBalance();
  const { status } = useStatus(groupName, groupOwner, address as string);

  const { relayFee } = useRelayFee();

  const state = useModal();

  const subscribe = useCallback(
    async (
      groupId: number,
      price: string,
      subType: number, // one month, three months, one year
    ) => {
      if (status === 1) {
        const totalFee = new BN(price, 10).add(new BN(relayFee, 10));
        const n = Number(divide10Exp(totalFee, 18));

        const count = 180;
        if (BscBalanceVal >= n) {
          let tmp = {};
          try {
            await MindStreamContract()
              .methods.subscribeOrRenew(groupOwner, subType)
              .send({
                from: address,
                value: totalFee,
                gasPrice: BSC_SEND_GAS_FEE,
              });

            const t = new Array(count).fill(1);

            let success = false;
            for (const {} of t) {
              const hasOwn = Number(
                await OwnContract(false)
                  .methods.balanceOf(address, Number(groupId))
                  .call(),
              );
              if (hasOwn > 0) {
                success = true;
                break;
              }
              await delay(1);
            }

            tmp = {
              variant: 'success',
              description: success ? 'Subscribe success' : 'pending',
              callBack: () => {
                window.location.reload();
              },
            };
          } catch (e: any) {
            tmp = {
              variant: 'error',
              description: e.message ? e.message : 'Buy failed',
            };
          }
          state.modalDispatch({
            type: 'OPEN_RESULT',
            result: tmp,
          });
          return true;
        } else {
          return false;
        }
      }
      return false;
    },
    [status, BscBalanceVal, relayFee],
  );
  return { subscribe, relayFee };
};
