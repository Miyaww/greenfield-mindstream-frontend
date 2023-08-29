// import { useGetChainProviders } from './useGetChainProviders';

import { client, selectSp } from '../utils/gfSDK';
import { useCallback, useState } from 'react';
import { useAccount } from 'wagmi';
import { getBucketFileList, getGroupInfoByName } from '../utils/gfSDK';
import { INode, Tree } from '../utils/tree';
import { generateGroupName } from '../utils';
import { getOffchainAuthKeys } from '../utils/off-chain-auth';
import { toast } from '@totejs/uikit';

export const SINGLE_OBJECT_MAX_SIZE = 128 * 1024 * 1024;
export const useChannelInfo = () => {
  const { address, connector } = useAccount();
  const [bucketFileList, setBucketFileList] = useState<any[]>([]);
  const [file, setFile] = useState<File>();
  const [txHash, setTxHash] = useState<string>();
  const getChannelInfo = useCallback(
    async (bucketId: string) => {
      const bucketInfo = await client.bucket.headBucketById(bucketId);
      return bucketInfo;
    },
    [address],
  );
  const [list, setList] = useState<INode[]>([]);
  const [loading, setLoading] = useState(true);
  const [num, setNum] = useState(0);
  const [creating, setCreating] = useState(false);

  const getChannelObjList = useCallback(
    (bucketName: string) => {
      if (bucketName) {
        getBucketFileList({ bucketName })
          .then(async (result: any) => {
            const { body, code } = result;
            if (code == 0) {
              let { objects } = body;
              objects = objects.filter((item: any) => !item.removed);
              const strColl = objects.map((item: any) => {
                const {
                  object_info: { object_name, id },
                } = item;
                // folder
                let hasFolder = false;
                if (object_name.indexOf('/') > -1) hasFolder = true;
                const isFile = object_name.slice(-1) !== '/';

                return hasFolder
                  ? object_name.slice(0, -1) +
                      '__' +
                      id +
                      '__' +
                      `${isFile ? 'file' : 'folder'}` +
                      '/'
                  : object_name + '__' + id + '__' + 'file';
              });

              const tree = new Tree(strColl.join('\n'));
              const _objInfo: { [str: string]: any } = {};

              const t = objects.map(async (item: any) => {
                const {
                  object_info: { bucket_name, object_name, id: objectId },
                } = item;
                // folder
                if (object_name.slice(-1) === '/') return {};

                const groupName = generateGroupName(bucket_name, object_name);
                const groupInfo = await getGroupInfoByName(
                  groupName,
                  address as string,
                );
                console.log(groupInfo, 'groupInfo');
                _objInfo[objectId] = item;
                if (!groupInfo) {
                  return item;
                }
                // else {
                //   if (!collectionListed) {
                //     const { id } = groupInfo;
                //     const result = await checkListed(id);

                //     const t = {
                //       ...item,
                //       groupId: id,
                //       listed: !!result,
                //       price: result,
                //     };
                //     _objInfo[objectId] = t;
                //     return t;
                //   }
                //   return item;
                // }
              });

              await Promise.all(t);
              tree.orderTraverse((item: any) => {
                const { _id } = item;
                Object.assign(item, _objInfo[_id] || {});
              });

              // cache[bucketName] = tree;
              setList(tree.list);
              setNum(objects.length);
            } else {
              setList([]);
            }
          })
          .finally(() => {
            setLoading(false);
          });
      }
    },
    [address],
  );
  const handleUploadFile = useCallback(
    async (file: any, bucketName: string, objectName: string) => {
      if (!address || !file) {
        toast.warning({ description: 'Please select a file or address' });
        return;
      }
      if (file.size > 1024 * 1024 * 100) {
        toast.warning({ description: 'File size too large' });
        return;
      }
      console.log('start', file.size);
      //todo get objectList in current path
      // const objectListObjectNames = objectList.map(
      //   (item) => bucketName + '/' + item.objectName,
      // );
      // const fullObjectName = [path, relativePath, file.name]
      //   .filter((item) => !!item)
      //   .join('/');

      // const isExistObjectList = objectListObjectNames.includes(fullObjectName);

      // if (isExistObjectList) {
      //   return E_OBJECT_NAME_EXISTS;
      // }
      setCreating(true);

      const provider = await connector?.getProvider();
      const offChainData = await getOffchainAuthKeys(address, provider);
      if (!offChainData) {
        console.log('No offchain, please create offchain pairs first');
        return;
      }
      const fileBytes = await file.arrayBuffer();
      const hashResult = await (window as any).FileHandle.getCheckSums(
        new Uint8Array(fileBytes),
      );
      const { contentLength, expectCheckSums } = hashResult;

      console.log('offChainData', offChainData);
      console.log('hashResult', hashResult);

      const createObjectTx = await client.object.createObject(
        {
          bucketName: bucketName,
          objectName: objectName,
          creator: address,
          visibility: 'VISIBILITY_TYPE_PUBLIC_READ',
          fileType: file.type,
          redundancyType: 'REDUNDANCY_EC_TYPE',
          contentLength,
          expectCheckSums: JSON.parse(expectCheckSums),
        },
        {
          type: 'EDDSA',
          domain: window.location.origin,
          seed: offChainData.seedString,
          address,
          // type: 'ECDSA',
          // privateKey: ACCOUNT_PRIVATEKEY,
        },
      );

      const simulateInfo = await createObjectTx.simulate({
        denom: 'BNB',
      });
      console.log('simulateInfo', simulateInfo);

      const res = await createObjectTx.broadcast({
        denom: 'BNB',
        gasLimit: Number(simulateInfo?.gasLimit),
        gasPrice: simulateInfo?.gasPrice || '5000000000',
        payer: address,
        granter: '',
      });

      console.log('res', res);

      if (res.code === 0) {
        alert('create object tx success');
        setTxHash(res.transactionHash);
      }
      if (!txHash) return;

      const uploadRes = await client.object.uploadObject(
        {
          bucketName: bucketName,
          objectName: objectName,
          body: file,
          txnHash: txHash,
        },
        {
          type: 'EDDSA',
          domain: window.location.origin,
          seed: offChainData.seedString,
          address,
        },
      );
      console.log('uploadRes', uploadRes);

      if (uploadRes.code === 0) {
        alert('success');
      }
    },
    [address],
  );

  return { getChannelInfo, getChannelObjList, handleUploadFile };
};
