import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { getBucketList, getGroupInfoByName } from '../utils/gfSDK';
import { DAPP_NAME } from '../env';
import { getChannelName } from '../utils/string';
import { GF_CHAIN_ID } from '../env';
export type BucketProps = {
  BucketInfo: {
    BucketName: string;
    BucketStatus: number;
    ChargedReadQuota: string;
    CreateAt: string;
    GlobalVirtualGroupFamilyId: number;
    Id: string;
    Owner: string;
    PaymentAddress: string;
    SourceType: string;
    Visibility: number;
  };
  CreateTxHash: string;
  DeleteAt: string;
  DeleteReason: string;
  Operator: string;
  Removed: boolean;
  UpdateAt: string;
  UpdateTime: string;
  UpdateTxHash: string;
};
export const useChannelList = () => {
  const [list, setList] = useState<BucketProps[]>();
  const [loading, setLoading] = useState(true);
  const [channelType, setChannelType] = useState<string[]>([]);
  const { address } = useAccount();
  if (!address) return { loading, list };
  const PUBLIC_BUCKET_NAME = getChannelName(address, GF_CHAIN_ID, 'public');
  const PRIVATE_BUCKET_NAME = getChannelName(address, GF_CHAIN_ID, 'private');

  useEffect(() => {
    if (address) {
      setLoading(true);
      getBucketList(address as string)
        .then(async (result: any) => {
          const { statusCode, body } = result;
          if (statusCode == 200 && Array.isArray(body)) {
            const t = body.filter(
              (item: BucketProps) =>
                !item.Removed &&
                (item.BucketInfo.BucketName.indexOf(PUBLIC_BUCKET_NAME) > -1 ||
                  item.BucketInfo.BucketName.indexOf(PRIVATE_BUCKET_NAME) > -1),
            );
            const res: any = await Promise.all(t);
            setList(res);
            res.map((item: BucketProps) => {
              const { BucketInfo } = item;
              const { BucketName } = BucketInfo;
              if (BucketName.indexOf(PUBLIC_BUCKET_NAME) > -1) {
                setChannelType((prev) => [...prev, 'public']);
              }
              if (BucketName.indexOf(PRIVATE_BUCKET_NAME) > -1) {
                setChannelType((prev) => [...prev, 'private']);
              }
            });
          } else {
            setLoading(false);
          }
        })
        .catch(() => {
          setList([]);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [address]);
  return { loading, list, channelType };
};
