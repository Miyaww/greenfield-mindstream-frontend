import { useEffect, useState } from 'react';
import {} from 'wagmi';
import { getSps, getRandomSp } from '../utils/gfSDK';
import { useAsyncEffect } from 'ahooks';
import { set } from 'date-fns';
import { SpItem } from '../utils/type';
import { getClient } from '../base/client';

export const useSP = () => {
  const [allSps, setAllSp] = useState<SpItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [oneSp, setOneSp] = useState<string>();
  const selectedEndpoint = 'https://gnfd-testnet-sp1.nodereal.io';

  const getStorageProviders = async () => {
    const sps = await getSps();
    return sps;
  };

  // useAsyncEffect(async () => {
  //   const client = await getClient();
  //   const endpoint = await client.sp.getSPUrlByBucket(editDetail.bucket_name);
  //   const primarySp = allSps.find(
  //     (sp: SpItem) => sp.endpoint === endpoint,
  //   ) as SpItem;
  // }, []);
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
          setOneSp(res);
        }
      })
      .catch(() => {
        setOneSp('');
      });
  }, []);
  return { loading, allSps, oneSp };
};
