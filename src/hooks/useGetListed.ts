// import { useCallback, useState, useEffect } from 'react';
// import { useGetChainProviders } from './useGetChainProviders';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';
import { MindStreamContract } from '../base/contract/mindStreamContract';
import { headGroupNFT } from '../utils/gfSDK';
import { parseGroupName } from '../utils';

export const useGetListed = (realAddress?: string, page = 0, pageSize = 10) => {
  const [list, setList] = useState(<any>[]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const { address: walletAddress } = useAccount();

  const address = useMemo(() => {
    return realAddress || walletAddress;
  }, [walletAddress, realAddress]);

  const getList = useCallback(async () => {
    setLoading(true);
    const list = await MindStreamContract(false)
      .methods.getUsersInfo((page - 1) * pageSize, pageSize)
      .call();
    console.log(list);
    const { _ids, _dates, _totalLength } = list;
    const { _addrs, _settings } = list;
    if (Array.isArray(_ids)) {
      const t = _ids.map((item: any) => {
        return headGroupNFT(item);
      });
      let result = await Promise.all(t);
      result = result
        .map((item: any, index) => {
          if (!Object.keys(item).length) return false;
          const {
            metaData: { attributes, groupName },
          } = item;
          const [owner, , , , extra] = attributes;
          const { type, name } = parseGroupName(groupName);
          const { price, url } = JSON.parse(extra.value);

          return {
            ...item,
            name,
            groupName,
            type,
            ownerAddress: owner.value,
            price,
            url,
            id: _ids[index],
            listTime: _dates[index],
          };
        })
        .filter((item) => item);
      setList(result);
      setTotal(_totalLength);
    } else {
      setList([]);
    }
    setLoading(false);
  }, [address, page, pageSize]);
  useEffect(() => {
    getList();
  }, [address, page, pageSize]);
  return { loading, list, total };
};
