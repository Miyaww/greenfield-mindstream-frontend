// import { useGetChainProviders } from './useGetChainProviders';

import { client, selectSp } from '../utils/gfSDK';
import { useCallback, useState } from 'react';
import { useAccount } from 'wagmi';
import dayjs from 'dayjs';
import { getOffchainAuthKeys } from '../utils/off-chain-auth';

interface ISp {
  id: number;
  endpoint: string;
  primarySpAddress: string;
  sealAddress: string;
  secondarySpAddresses: string[];
}

export const SINGLE_OBJECT_MAX_SIZE = 128 * 1024 * 1024;
export const useChannelInfo = (bucketId: string, bucketName: string) => {
  const [spInfo, setSpInfo] = useState<ISp>();
  const [loading, setLoading] = useState(false);
  const [primarySp, setPrimarySp] = useState<string>();
  const [bucketInfo, setBucketInfo] = useState<any>();
  const [objectList, setObjectList] = useState<any[]>([]);
  const { address, connector } = useAccount();

  const getSpInfo = useCallback(async () => {
    const spInfo = await selectSp();
    setSpInfo(spInfo);
    return spInfo;
  }, []);
  const fetchChannelInfo = useCallback(async () => {
    if (bucketId && bucketName) {
      setLoading(true);
      try {
        await Promise.all([
          getChannelInfo(bucketId),
          getBucketMeta(bucketName),
          getObjectsListByBucketName(bucketName),
          getPrimarySpEndpoint(),
        ]);
      } catch (error) {
        // Handle the error
        setLoading(false);
      } finally {
        setLoading(false);
        console.log('getChannelInfo', objectList);
      }
    }
  }, [bucketId, bucketName]);

  const getPrimarySpEndpoint = useCallback(async () => {
    const endpoint = await client.sp.getSPUrlByBucket(bucketName);
    setPrimarySp(endpoint);
  }, []);
  const getChannelInfo = useCallback(async (bucketId: string) => {
    const { bucketInfo } = await client.bucket.headBucketById(bucketId);
    setBucketInfo(bucketInfo);
    return bucketInfo;
  }, []);
  const getBucketMeta = useCallback(
    async (bucketName: string) => {
      const sp = await getSpInfo();
      if (!sp) return;
      const bucketMeta = await client.bucket.getBucketMeta({
        bucketName,
        endpoint: sp.endpoint,
      });
      return bucketMeta;
    },
    [getSpInfo],
  );
  const getObjectsListByBucketName = useCallback(
    async (bucketName: string) => {
      try {
        const sp = await getSpInfo();
        if (!sp) return;
        const res = await client.object.listObjects({
          bucketName,
          endpoint: sp.endpoint,
        });
        if (res.code === 0) {
          const { body } = res;
          const { Objects } = body.GfSpListObjectsByBucketNameResponse;
          setObjectList(Objects);
          console.log(Objects);
          return Objects;
        }
      } catch (e) {
        console.log(e);
        setObjectList([]);
        return [];
      }
    },
    [getSpInfo],
  );
  const getObjectPreviewLink = useCallback(
    async (objectName: string, duration = 24 * 60 * 60) => {
      if (!address) return;
      const provider = await connector?.getProvider();
      const offChainData = await getOffchainAuthKeys(address, provider);
      if (!offChainData) {
        alert('No offchain, please create offchain pairs first');
        return;
      }

      const res = await client.object.getObjectPreviewUrl(
        {
          bucketName,
          objectName,
          queryMap: {
            view: '1',
            'X-Gnfd-User-Address': address,
            'X-Gnfd-App-Domain': window.location.origin,
            'X-Gnfd-Expiry-Timestamp': dayjs()
              .add(duration, 'second')
              .toISOString(),
          },
        },
        {
          type: 'EDDSA',
          address,
          domain: window.location.origin,
          seed: offChainData.seedString,
        },
      );
      return res;
    },
    [],
  );

  return {
    bucketInfo,
    objectList,
    loading,
    primarySp,
    fetchChannelInfo,
    getObjectPreviewLink,
  };
};
//policy user/group
//private get/set
