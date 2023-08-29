import { GF_CHAIN_ID, GF_RPC_URL } from '../../env';
import { Client } from '@bnb-chain/greenfield-js-sdk';

export const getSingleton = function () {
  let client: Client | null;
  return async function () {
    if (!client) {
      // const { Client } = await import('@bnb-chain/greenfield-js-sdk');
      client = Client.create(GF_RPC_URL, String(GF_CHAIN_ID), {
        zkCryptoUrl:
          'https://unpkg.com/@bnb-chain/greenfield-zk-crypto@0.0.2-alpha.4/dist/node/zk-crypto.wasm',
      });
    }
    return client;
  };
};

export const getClient = getSingleton();
