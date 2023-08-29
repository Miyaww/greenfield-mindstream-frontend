// import { client, selectSp } from '../utils/gfSDK';
// import { ChangeEvent, useState } from 'react';
// import { useAccount } from 'wagmi';
// import { useNavigate, useSearchParams } from 'react-router-dom';
// import { useChannelInfo } from '../hooks/useChannelInfo';
// import { useAsyncEffect } from 'ahooks';
// import { Button, Box, Flex, Text } from '@totejs/uikit';
// import styled from '@emotion/styled';
// import { getUtcZeroTimestamp } from '@bnb-chain/greenfield-js-sdk';

// export const ChannelDetail = () => {
//   const { address } = useAccount();
//   const [bucketInfo, setBucketInfo] = useState('');
//   const [p] = useSearchParams();
//   const bucketId = p.getAll('bucketId')[0];
//   const bucketName = p.getAll('bucketName')[0];
//   const [file, setFile] = useState<File>();
//   const { getChannelInfo, getChannelObjList, handleUploadFile } =
//     useChannelInfo();
//   useAsyncEffect(async () => {
//     if (bucketId) {
//       await getChannelInfo(bucketId).then((result: any) => {
//         if (result) {
//           const { bucketInfo } = result;
//           setBucketInfo(bucketInfo);
//         }
//       });
//     }
//   }, [bucketId]);
//   useAsyncEffect(async () => {
//     if (bucketName) {
//       const res = await getChannelObjList(bucketName);
//       console.log(res);
//     }
//   }, [bucketId]);
//   const handleFilesChange = async (e: ChangeEvent<HTMLInputElement>) => {
//     console.log(e);
//     const files = e.target.files;
//     if (!files || !files.length) return;
//     Object.values(files).forEach((file: File) => {
//       const time = getUtcZeroTimestamp();
//       const id = parseInt(String(time * Math.random()));
//       setFile(file);
//       console.log(file);
//     });
//     e.target.value = '';
//   };
//   return (
//     <Flex
//       w="100%"
//       maxW={1200}
//       px={40}
//       py={80}
//       direction="column"
//       alignItems={'center'}
//     >
//       <Title>channel info</Title>
//       <label htmlFor="files-upload">
//         <Box
//           onClick={() => {
//             handleUploadFile(file, bucketName, file?.name ? file.name : '');
//           }}
//         >
//           <input
//             type="file"
//             id="files-upload"
//             onChange={handleFilesChange}
//             style={{
//               visibility: 'hidden',
//               position: 'absolute',
//               top: 0,
//               left: 0,
//               right: 0,
//               bottom: 0,
//             }}
//           />
//           Upload
//         </Box>
//       </label>
//     </Flex>
//   );
// };

// const Title = styled(Text)`
//   font-size: 40px;
//   font-weight: 500;
//   line-height: 58px;
//   font-family: 'Zen Dots';
//   text-transform: uppercase;
// `;
import { client, selectSp } from '../utils/gfSDK';
import { ChangeEvent, useState } from 'react';
import { useAccount } from 'wagmi';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useChannelInfo } from '../hooks/useChannelInfo';
import { useAsyncEffect } from 'ahooks';
import { Button, Box, Flex, Text } from '@totejs/uikit';
import styled from '@emotion/styled';
import { getUtcZeroTimestamp } from '@bnb-chain/greenfield-js-sdk';
import {
  getSpOffChainData,
  getOffchainAuthKeys,
} from '../utils/off-chain-auth';
export const ChannelDetail = () => {
  const { address, connector } = useAccount();
  const [file, setFile] = useState<File>();
  const [txHash, setTxHash] = useState<string>();
  const [createObjectInfo, setCreateObjectInfo] = useState({
    bucketName: '',
    objectName: '',
  });

  return (
    <div>
      <>
        <h4>Create Object</h4>
        bucket name :
        <input
          value={createObjectInfo.bucketName}
          placeholder="bucket name"
          onChange={(e) => {
            setCreateObjectInfo({
              ...createObjectInfo,
              bucketName: e.target.value,
            });
          }}
        />
        <br />
        object name :
        <input
          value={createObjectInfo.objectName}
          placeholder="object name"
          onChange={(e) => {
            setCreateObjectInfo({
              ...createObjectInfo,
              objectName: e.target.value,
            });
          }}
        />
        <br />
        <input
          type="file"
          placeholder="select a file"
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            if (e.target.files) {
              setFile(e.target.files[0]);
            }
          }}
        />
        <br />
        <button
          onClick={async () => {
            if (!address || !file) {
              alert('Please select a file or address');
              return;
            }

            const provider = await connector?.getProvider();
            const offChainData = await getOffchainAuthKeys(address, provider);

            if (!offChainData) {
              alert('No offchain, please create offchain pairs first');
              return;
            }

            const fileBytes = await file.arrayBuffer();
            const hashResult = await (window as any).FileHandle.getCheckSums(
              new Uint8Array(fileBytes),
            );
            // console.log('hashResult', hashResult);

            const { contentLength, expectCheckSums } = hashResult;

            const createObjectTx = await client.object.createObject(
              {
                bucketName: createObjectInfo.bucketName,
                objectName: createObjectInfo.objectName,
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
          }}
        >
          1. create object tx
        </button>
        <br />
        <button
          onClick={async () => {
            if (!address || !file || !txHash) return;
            console.log(file);

            const provider = await connector?.getProvider();
            const offChainData = await getOffchainAuthKeys(address, provider);
            if (!offChainData) {
              alert('No offchain, please create offchain pairs first');
              return;
            }

            const uploadRes = await client.object.uploadObject(
              {
                bucketName: createObjectInfo.bucketName,
                objectName: createObjectInfo.objectName,
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
          }}
        >
          2. upload
        </button>
        <br />
        <button
          onClick={async () => {
            if (!address) return;

            const provider = await connector?.getProvider();
            const offChainData = await getOffchainAuthKeys(address, provider);
            if (!offChainData) {
              alert('No offchain, please create offchain pairs first');
              return;
            }

            const createFolderTx = await client.object.createFolder(
              {
                bucketName: createObjectInfo.bucketName,
                objectName: createObjectInfo.objectName + '/',
                creator: address,
              },
              {
                type: 'EDDSA',
                domain: window.location.origin,
                seed: offChainData.seedString,
                address,
              },
            );

            const simulateInfo = await createFolderTx.simulate({
              denom: 'BNB',
            });

            console.log('simulateInfo', simulateInfo);

            const res = await createFolderTx.broadcast({
              denom: 'BNB',
              gasLimit: Number(simulateInfo?.gasLimit),
              gasPrice: simulateInfo?.gasPrice || '5000000000',
              payer: address,
              granter: '',
            });

            console.log('res', res);

            if (res.code === 0) {
              alert('success');
            }
          }}
        >
          create folder
        </button>
      </>
    </div>
  );
};
