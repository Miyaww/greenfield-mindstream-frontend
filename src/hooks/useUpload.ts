import { useAccount } from 'wagmi';
import { useCallback, useState } from 'react';
import { toast } from '@totejs/uikit';
import { getOffchainAuthKeys } from '../utils/off-chain-auth';
import { client } from '../utils/gfSDK';
import {
  getUtcZeroTimestamp,
  ISimulateGasFee,
} from '@bnb-chain/greenfield-js-sdk';
import { getDomain } from '../utils/getDomain';

export const useUpload = () => {
  const { address, connector } = useAccount();
  const [simulateInfo, setSimulateInfo] = useState<ISimulateGasFee>();
  const [pending, setPending] = useState(false);
  const [simloading, setSimloading] = useState(false);
  const domain = getDomain();
  const timestamp = getUtcZeroTimestamp();
  const simulateTx = useCallback(
    async (file: File, bucketName: string, fileName: string) => {
      if (!address) return {};
      console.log(simloading, 'simloading');
      try {
        if (!address || !file) {
          toast.warning({ description: 'Please select a file or address' });
          return;
        }
        const objectName = `${fileName}-${timestamp}`;
        if (file.size > 1024 * 1024 * 100) {
          toast.warning({ description: 'File size too large' });
          return;
        }
        setSimloading(true);

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
            domain,
            seed: offChainData.seedString,
            address,
          },
        );

        const simulateInfo = await createObjectTx.simulate({
          denom: 'BNB',
        });
        setSimulateInfo(simulateInfo);
        setSimloading(false);
        return { simulateInfo, createObjectTx, offChainData };
      } catch (err) {
        console.log(err);
      }
      setSimloading(false);
      return {};
    },
    [address],
  );
  const handleUploadFile = useCallback(
    async (file: any, bucketName: string, fileName: string) => {
      if (!address || !file) return {};
      try {
        const objectName = `${fileName}-${timestamp}`;
        if (file.size > 1024 * 1024 * 100) {
          toast.warning({ description: 'File size too large' });
          return;
        }
        setPending(true);
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

        const createObjectTx = await client.object.createObject(
          {
            bucketName: bucketName,
            objectName: objectName,
            creator: address,
            visibility: bucketName.includes('public')
              ? 'VISIBILITY_TYPE_PUBLIC_READ'
              : 'VISIBILITY_TYPE_PRIVATE',
            fileType: file.type,
            redundancyType: 'REDUNDANCY_EC_TYPE',
            contentLength,
            expectCheckSums: JSON.parse(expectCheckSums),
          },
          {
            type: 'EDDSA',
            domain,
            seed: offChainData.seedString,
            address,
          },
        );

        const simulateInfo = await createObjectTx.simulate({
          denom: 'BNB',
        });

        const res = await createObjectTx.broadcast({
          denom: 'BNB',
          gasLimit: Number(simulateInfo?.gasLimit),
          gasPrice: simulateInfo?.gasPrice || '5000000000',
          payer: address,
          granter: '',
        });

        const txHash = res.transactionHash;

        const uploadRes = await client.object.uploadObject(
          {
            bucketName: bucketName,
            objectName: objectName,
            body: file,
            txnHash: txHash,
          },
          {
            type: 'EDDSA',
            domain,
            seed: offChainData.seedString,
            address,
          },
        );
        if (uploadRes.code === 0) {
          toast.success({ description: 'Upload Success' });
        }
        setSimulateInfo(simulateInfo);
        setPending(false);
        return uploadRes.code;
      } catch (err) {
        console.log(err);
        setPending(false);
      }
      setPending(false);
      return {};
    },
    [address],
  );
  return { pending, handleUploadFile, simulateInfo, simulateTx, simloading };
};
