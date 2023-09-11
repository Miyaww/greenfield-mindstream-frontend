import { GF_RPC_URL, GF_CHAIN_ID, DAPP_NAME, BSC_CHAIN_ID } from '../env';
import { Client } from '@bnb-chain/greenfield-js-sdk';
import { sortBy } from 'lodash-es';
import { getClient } from '../base/client';
export const client = Client.create(GF_RPC_URL, String(GF_CHAIN_ID), {
  zkCryptoUrl:
    'https://unpkg.com/@bnb-chain/greenfield-zk-crypto@0.0.2-alpha.4/dist/node/zk-crypto.wasm',
});
export const getSps = async () => {
  const client = await getClient();
  const sps = await client.sp.getStorageProviders();
  console.log(sps, 'sps');
  const finalSps = (sps ?? []).filter(
    (v: any) => v.endpoint.includes('nodereal') && !v.endpoint.includes('ali'),
  );

  const sorted = sortBy(finalSps, ['moniker', 'operatorAddress']);
  return sorted;
};

export const getAllSps = async () => {
  const sps = await getSps();

  return sps.map((sp) => {
    return {
      address: sp.operatorAddress,
      endpoint: sp.endpoint,
      name: sp.description?.moniker,
    };
  });
};
export const selectSp = async () => {
  const finalSps = await getSps();

  const selectIndex = Math.floor(Math.random() * finalSps.length);

  const secondarySpAddresses = [
    ...finalSps.slice(0, selectIndex),
    ...finalSps.slice(selectIndex + 1),
  ].map((item) => item.operatorAddress);

  const selectSpInfo = {
    id: finalSps[selectIndex].id,
    endpoint: finalSps[selectIndex].endpoint,
    primarySpAddress: finalSps[selectIndex]?.operatorAddress,
    sealAddress: finalSps[selectIndex].sealAddress,
    secondarySpAddresses,
  };

  return selectSpInfo;
};
export const getRandomSp = async () => {
  const client = await getClient();
  const sps = await client.sp.getStorageProviders();
  const finalSps = (sps ?? []).filter(
    (v: any) =>
      v?.description?.moniker !== 'QATest' &&
      (v.endpoint.indexOf('bnbchain.org') > 0 ||
        v.endpoint.indexOf('nodereal.io') > 0 ||
        v.endpoint.indexOf('nodereal.cc') > 0),
  );
  return finalSps[Math.floor(Math.random() * finalSps.length)].endpoint;
};

export const multiTx = async (list: any) => {
  // const client = await getClient();
  return await client.basic.multiTx(list);
};

export const getBucketList = async (address: string) => {
  // const client = await getClient();
  const endpoint = await getRandomSp();
  const bucketList = await client.bucket.getUserBuckets({
    address,
    endpoint,
  });

  return bucketList;
};

// export const getQuota = async (bucketName: string) => {
//   try {
//     const endpoint = await getRandomSp();
//     const { code, body } = await client.bucket.getBucketReadQuota({
//       bucketName,
//       endpoint,
//     });
//     if (code !== 0 || !body) {
//       console.error(`Get bucket read quota met error. Error code: ${code}`);
//       return null;
//     }
//     const { freeQuota, readQuota, consumedQuota } = body;
//     return {
//       freeQuota,
//       readQuota,
//       consumedQuota,
//     };
//   } catch (error) {
//     // eslint-disable-next-line no-console
//     console.error('get bucket read quota error', error);
//     return null;
//   }
// };

export const getBucketFileList = async ({ bucketName }: any) => {
  const endpoint = await getRandomSp();
  const client = await getClient();
  const fileList = await client.object.listObjects({
    bucketName,
    endpoint,
  });

  return fileList;
};

interface MsgCreateGroup {
  /** owner defines the account address of group owner who create the group */
  creator: string;
  /** group_name defines the name of the group. it's not globally unique. */
  groupName: string;
  /** member_request defines a list of member which to be add or remove */
  members: string[];

  extra: string;
}

export const CreateGroup = async (params: MsgCreateGroup) => {
  const client = await getClient();

  return await client.group.createGroup(params);
};

export const putObjectPolicy = async (
  bucketName: string,
  ObjectName: string,
  srcMsg: any,
) => {
  const client = await getClient();

  return await client.object.putObjectPolicy(bucketName, ObjectName, srcMsg);
};

export const putBucketPolicy = async (bucketName: string, srcMsg: any) => {
  const client = await getClient();

  return await client.bucket.putBucketPolicy(bucketName, srcMsg);
};

export const getGroupInfoByName = async (
  groupName: string,
  groupOwner: string,
) => {
  const client = await getClient();
  try {
    const { groupInfo } = await client.group.headGroup(groupName, groupOwner);
    console.log(groupInfo, 'getGroupInfoByName');
    return groupInfo;
  } catch (e) {
    return null;
  }
};

export const checkGroupExistByName = async (
  groupName: string,
  groupOwner: string,
) => {
  const o = await getGroupInfoByName(groupName, groupOwner);
  return o ? Object.keys(o).length : 0;
};

export const checkGroupExistById = async (tokenId: string) => {
  const o = await headGroupNFT(tokenId);
  return Object.keys(o).length;
};

export const checkAddressInGroup = async (
  groupName: string,
  groupOwner: string,
  member: string,
) => {
  const client = await getClient();
  try {
    return await client.group.headGroupMember(groupName, groupOwner, member);
  } catch (e) {
    return false;
  }
};

export const headGroupNFT = async (tokenId: string) => {
  const client = await getClient();

  try {
    return await client.group.headGroupNFT({ tokenId });
  } catch (e) {
    return {};
  }
};
export const headGroup = async (groupName: string, address: string) => {
  const client = await getClient();
  try {
    return await client.group.headGroup(groupName, address);
  } catch (e) {
    return {};
  }
};
export const getObjectInfo = async (objectId: string) => {
  const client = await getClient();

  return await client.object.headObjectById(objectId);
};

export const getObjectInfoByName = async (
  bucketName: string,
  objectName: string,
) => {
  const client = await getClient();

  return await client.object.headObject(bucketName, objectName);
};

export const updateGroupInfo = async (
  address: string,
  groupName: string,
  extra: string,
) => {
  const client = await getClient();
  return await client.group.updateGroupExtra({
    operator: address,
    groupOwner: address,
    groupName,
    extra,
  });
};

export const mirrorGroup = async (
  groupName: string,
  id: string,
  operator: string,
  destChainId?: number,
) => {
  const client = await getClient();
  return await client.crosschain.mirrorGroup({
    groupName,
    id,
    operator,
    destChainId: BSC_CHAIN_ID,
  });
};

export const getCollectionInfo = async (bucketId: string) => {
  const client = await getClient();
  return await client.bucket.headBucketById(bucketId);
};

export const getCollectionInfoByName = async (bucketName: string) => {
  const client = await getClient();
  return await client.bucket.headBucket(bucketName);
};

export const searchKey = async (key: string) => {
  const client = await getClient();

  try {
    return await client.sp.listGroup(key, `${DAPP_NAME}_`, {
      sourceType: 'SOURCE_TYPE_ORIGIN',
      limit: 1000,
      offset: 0,
    });
  } catch (e) {
    return [];
  }
};
