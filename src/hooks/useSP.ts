import { useEffect, useState } from 'react';
import {} from 'wagmi';
import { getSps, getRandomSp } from '../utils/gfSDK';
import { SpItem } from '../utils/type';

export const useSP = () => {
  const [allSps, setAllSp] = useState<SpItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [oneSp, setOneSp] = useState<string>();
  const selectedEndpoint = 'https://gnfd-testnet-sp1.nodereal.io';

  const getStorageProviders = async () => {
    const sps = await getSps();
    return sps;
  };
  useEffect(() => {
    setLoading(true);
    getStorageProviders()
      .then(async (result: any) => {
        if (result) {
          setAllSp(result);
        } else {
          setLoading(false);
        }
      })
      .catch(() => {
        setAllSp([]);
      })
      .finally(() => {
        setLoading(false);
      });
    getRandomSp()
      .then(async (res) => {
        if (res) {
          console.log(res, 'oneSp');
          setOneSp(res);
        }
      })
      .catch(() => {
        setOneSp('');
      });
  }, []);
  return { loading, allSps, oneSp };
};
