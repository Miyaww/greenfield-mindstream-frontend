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
    const { _profiles, _totalLength, _addrs } = list;
    if (Array.isArray(_profiles)) {
      const result = _profiles.map((item: any, index: number) => {
        const { avatar, name, bio } = item;
        const address = _addrs[index];
        return { avatar, name, bio, address };
      });
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
