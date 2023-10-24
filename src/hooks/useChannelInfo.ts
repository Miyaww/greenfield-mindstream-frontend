import { client, selectSp, getGroupInfoByName } from '../utils/gfSDK';
import { useCallback, useState, useMemo, useEffect } from 'react';
import { useAccount } from 'wagmi';
import dayjs from 'dayjs';
import { getOffchainAuthKeys } from '../utils/off-chain-auth';
import { useModal } from './useModal';
import { BucketProps } from '../base/type';
import { useChannelList } from './useChannelList';
import { encodeObjectName, generateGroupName } from '../utils';
import { useSearchParams } from 'react-router-dom';
import { id } from 'date-fns/locale';
import { set } from 'date-fns';

export const SINGLE_OBJECT_MAX_SIZE = 128 * 1024 * 1024;
export const useChannelInfo = () => {
  const { address: realAddress, connector } = useAccount();
  const modalData = useModal();
  const { activeGroup } = modalData.modalState;
  console.log(activeGroup, 'activeGroup');
  const { groupName, ownerAddress } = activeGroup;
  // const [groupName, setGroupName] = useState<string>(initialGroupName);
  const [params] = useSearchParams();
  const tab = params.get('tab');
  const isSelf = realAddress === ownerAddress;
  const [loading, setLoading] = useState(false);
  const [primarySp, setPrimarySp] = useState<string>();

  const [bucketInfo, setBucketInfo] = useState<any>();

  const [privateObjList, setPrivateObjList] = useState<any[]>([]);
  const [publicObjList, setPublicObjList] = useState<any[]>([]);

  const address = ownerAddress || realAddress;
  console.log(ownerAddress, 'address');
  const { list: channelList, loading: listLoading } = useChannelList(
    address as string,
  );

  const privateBucketName = useMemo(() => {
    const matchingItem = channelList?.find((item: BucketProps) => {
      return item.BucketInfo.BucketName.includes('private');
    });
    return matchingItem ? matchingItem.BucketInfo.BucketName : '';
  }, [channelList]);
  const publicBucketName = useMemo(() => {
    const matchingItem = channelList?.find((item: BucketProps) => {
      return item.BucketInfo.BucketName.includes('public');
    });
    return matchingItem ? matchingItem.BucketInfo.BucketName : '';
  }, [channelList]);
  // useEffect(() => {
  //   tab === 'private'
  //     ? setGroupName(generateGroupName(privateBucketName))
  //     : setGroupName(generateGroupName(publicBucketName));
  // }, [tab]);

  const getSpInfo = useCallback(async () => {
    const spInfo = await selectSp();
    return spInfo;
  }, []);

  const fetchChannelInfo = useCallback(async () => {
    if (listLoading) return;
    setLoading(true);
    console.log('fetchChannelInfo', address, groupName);

    if (address && groupName) {
      try {
        await Promise.all([
          getChannelInfo(),
          getObjectsListByBucketName(privateBucketName, 'private'),
          getObjectsListByBucketName(publicBucketName, 'public'),
        ]);
      } catch (error) {
        // Handle the error
        setLoading(false);
      } finally {
        setLoading(false);
        console.log('getChannelInfo', privateObjList, publicObjList, loading);
      }
    }
  }, [listLoading, address, groupName]);
  useEffect(() => {
    fetchChannelInfo();
  }, [fetchChannelInfo]);

  const getChannelInfo = useCallback(async () => {
    let realgroupName = groupName;
    if (isSelf) {
      realgroupName = generateGroupName(privateBucketName);
    }
    const res = await getGroupInfoByName(realgroupName, address as string);
    if (res) {
      setBucketInfo({ ...bucketInfo, realgroupName, groupId: Number(res.id) });
      return { ...bucketInfo, realgroupName, groupId: Number(res.id) };
    }
    setBucketInfo(bucketInfo);
    return bucketInfo;
  }, [groupName, address]);

  const getObjectsListByBucketName = useCallback(
    async (bucketName: string, type: 'private' | 'public') => {
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
          if (type === 'private') setPrivateObjList(Objects);
          if (type === 'public') setPublicObjList(Objects);
          console.log(Objects);
        }
      } catch (e) {
        console.log(e);
        setPrivateObjList([]);
        setPublicObjList([]);
      }
    },
    [getSpInfo],
  );
  const getObjectPreviewLink = useCallback(
    async (objectName: string, bucketName: string, duration = 24 * 60 * 60) => {
      if (!realAddress) return;
      const provider = await connector?.getProvider();
      const offChainData = await getOffchainAuthKeys(realAddress, provider);
      if (!offChainData) {
        alert('No offchain, please create offchain pairs first');
        return;
      }
      const groupType = bucketName.includes('private') ? 'private' : 'public';
      if (groupType === 'public') {
        const encodedObjectName = encodeObjectName(objectName);

        const previewLink = encodeURI(
          `${primarySp}/view/${bucketName}/${encodedObjectName}`,
        ).replaceAll('%2520', '%20');
        return previewLink;
      }

      const res = await client.object.getObjectPreviewUrl(
        {
          bucketName,
          objectName,
          queryMap: {
            view: '1',
            'X-Gnfd-User-Address': realAddress,
            'X-Gnfd-App-Domain': window.location.origin,
            'X-Gnfd-Expiry-Timestamp': dayjs()
              .add(duration, 'second')
              .toISOString(),
          },
        },
        {
          type: 'EDDSA',
          address: realAddress,
          domain: window.location.origin,
          seed: offChainData.seedString,
        },
      );
      return res;
    },
    [groupName],
  );

  return {
    bucketInfo,
    publicObjList,
    privateObjList,
    loading,
    primarySp,
    fetchChannelInfo,
    getObjectPreviewLink,
  };
};
