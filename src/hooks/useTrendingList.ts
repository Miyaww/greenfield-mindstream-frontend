// import { useCallback, useState, useEffect } from 'react';
// import { useGetChainProviders } from './useGetChainProviders';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { MindStreamContract } from '../base/contract/mindStreamContract';
import { headGroupNFT } from '../utils/gfSDK';
import Web3 from 'web3';

export interface ITrendingListItem {
  groupName: string;
  ownerAddress: string;
  prices: [];
  salesVolume: string;
  salesRevenue: string;
  groupId: string;
  avatar: string;
  authorName: string;
  rank: number;
  bucketName: string;
  bucketId: string;
}

export const useTrendingList = () => {
  const [list, setList] = useState<ITrendingListItem[] | object[]>();
  const [loading, setLoading] = useState(true);

  const { address } = useAccount();

  useEffect(() => {
    MindStreamContract(false)
      .methods.getSalesVolumeRanking()
      .call({ from: address })
      .then(async (result: any) => {
        const { _addrs } = result;
        if (Array.isArray(_addrs)) {
          const t = _addrs
            .filter((item: string) => {
              return Web3.utils.isAddress(item);
            })
            .map(async (item: string) => {
              const salesPromise = MindStreamContract(false)
                .methods.getStatusByAddress(item)
                .call({ from: address });
              const profilePromise = MindStreamContract(false)
                .methods.getProfileByAddress(item)
                .call({ from: address });
              const sale = await salesPromise;
              const profile = await profilePromise;
              return { ...sale, ...profile };
            });
          let subStatusList = await Promise.all(t);
          console.log(subStatusList, 'subStatusList');
          subStatusList = subStatusList
            .filter((item: any) => item._subscribeID !== '0')
            .map((item: any) => {
              const {
                _salesRevenue,
                _salesVolume,
                _subscribeID,
                _prices,
                _avatar,
                _name,
              } = item;
              return {
                _salesRevenue,
                _salesVolume,
                _subscribeID,
                _prices,
                _avatar,
                _name,
              };
            });
          const temp = subStatusList.map((item) => {
            return headGroupNFT(item._subscribeID);
          });
          let groupList = await Promise.all(temp);
          console.log(groupList, 'temp');
          groupList = groupList.map((item: any, index) => {
            if (!Object.keys(item).length) return false;
            const {
              metaData: { attributes, groupName },
            } = item;
            const [Owner] = attributes;

            return {
              ...item,
              groupName,
              ownerAddress: Owner.value,
              prices: subStatusList[index]._prices,
              salesVolume: subStatusList[index]._salesVolume,
              salesRevenue: subStatusList[index]._salesRevenue,
              groupId: subStatusList[index]._subscribeID,
              avatar: subStatusList[index]._avatar,
              authorName: subStatusList[index]._name,
              rank: index + 1,
            };
          });
          setList(groupList);
        } else {
          setLoading(false);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return { loading, list };
};
