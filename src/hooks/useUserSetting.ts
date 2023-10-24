import { MindStreamContract } from '../base/contract/mindStreamContract';
import { useAccount } from 'wagmi';
import { useCallback, useState } from 'react';
import { useAsyncEffect } from 'ahooks';
import { BSC_SEND_GAS_FEE } from '../env';

interface IUpdateProfileParams {
  _name: string;
  _avatar: string;
  _bio: string;
}
interface IProfile {
  name: string;
  avatar: string;
  bio: string;
}
export const useUserSetting = () => {
  const { address } = useAccount();
  const [loading, setLoading] = useState(false);
  const [hasOpenUpSub, sethasOpenUpSub] = useState(false);
  const [currentUserPrices, setCurrentUserPrice] = useState([]);
  useAsyncEffect(async () => {
    if (address) {
      setLoading(true);
      const res = await getSubPrice(address);
      if (res && res[0] !== '0') {
        setCurrentUserPrice(res);
        sethasOpenUpSub(true);
        setLoading(false);
      }
      setLoading(false);
    }
  }, [address]);

  const getSubPrice = useCallback(
    async (ownerAddress: string) => {
      if (ownerAddress) {
        setLoading(true);
        const result = await MindStreamContract(false)
          .methods.getStatusByAddress(ownerAddress)
          .call();
        if (result) {
          const { _prices } = result;
          setLoading(false);
          return _prices;
        }
      }
    },
    [address],
  );
  const getUsersInfo = useCallback(async () => {
    setLoading(true);
    const result = await MindStreamContract(false)
      .methods.getUsersInfo(0, 100)
      .call();
    console.log(result, 'getUsersInfo');

    if (result) {
      return result;
    }
  }, []);

  return { loading, currentUserPrices, hasOpenUpSub, getSubPrice };
};
