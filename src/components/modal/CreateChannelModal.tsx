import styled from '@emotion/styled';
import { ColoredWarningIcon } from '@totejs/icons';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  RadioGroup,
  HStack,
  Radio,
  Button,
  FormControl,
  FormLabel,
  LightMode,
  Box,
  Flex,
  toast,
  FormErrorMessage,
} from '@totejs/uikit';
import { useMemo, useState, useRef, useCallback } from 'react';
import { useAccount, useNetwork, useSwitchNetwork } from 'wagmi';
import { GF_CHAIN_ID } from '../../env';
import { useChainBalance } from '../../hooks/useChainBalance';
import { Loader } from '../Loader';
import { roundFun, generateGroupName, delay } from '../../utils';
import { getDomain } from '../../utils/getDomain';
import { debounce, isEmpty, isNumber } from 'lodash-es';
import BigNumber from 'bignumber.js';
import { useChannelList } from '../../hooks/useChannelList';
import { useModal } from '../../hooks/useModal';
import {
  client,
  selectSp,
  CreateGroup,
  getGroupInfoByName,
  mirrorGroup,
  multiTx,
  putBucketPolicy,
} from '../../utils/gfSDK';
import { getOffchainAuthKeys } from '../../utils/off-chain-auth';
import { getChannelName } from '../../utils/string';
import {
  ISimulateGasFee,
  PermissionTypes,
  GRNToString,
  newGroupGRN,
  newObjectGRN,
} from '@bnb-chain/greenfield-js-sdk';
import { OwnBuyContract } from '../../base/contract/ownBuyContract';

interface ListModalProps {
  isOpen: boolean;
  handleOpen: (show: boolean) => void;
}
export type TNameFieldValue = {
  bucketName: string;
};
type ValidateNameAndGas = {
  isValidating: boolean;
  gas: {
    available: boolean;
    value: BigNumber | null;
  };
  name: {
    available: boolean;
    value: string | null;
  };
};
const initValidateNameAndGas = {
  isValidating: false,
  gas: {
    available: true,
    value: null,
  },
  name: {
    available: true,
    value: null,
  },
};
export type TCreateBucketFromValues = TNameFieldValue;
export const MIN_AMOUNT = '0.00000001';

export const CreateChannelModal = (props: ListModalProps) => {
  const { isOpen, handleOpen } = props;
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('pending');
  const [simulateInfo, setSimulateInfo] = useState<ISimulateGasFee>();
  const stateModal = useModal();

  const nonceRef = useRef(0);
  const [type, setType] = useState<string>();
  const { address, connector } = useAccount();
  const { GfBalanceVal } = useChainBalance();
  const { switchNetwork } = useSwitchNetwork();
  const { channelType } = useChannelList(address as string);
  const [bucketName, setBucketName] = useState<string>('');
  const [groupName, setGroupName] = useState<string>('');

  const domain = getDomain();
  const onClose = () => {
    handleOpen(false);
    setStatus('pending');
    setType('');
  };
  const balance = useMemo(() => BigNumber(GfBalanceVal || 0), [GfBalanceVal]);

  const { chain } = useNetwork();
  const [validateNameAndGas, setValidateNameAndGas] =
    useState<ValidateNameAndGas>(initValidateNameAndGas);
  const disableCreateButton = () => {
    return (
      (!isEmpty(validateNameAndGas) &&
        (validateNameAndGas.isValidating ||
          !validateNameAndGas.gas.available ||
          !validateNameAndGas.name.available)) ||
      !type ||
      !isEnoughBalance
    );
  };

  const isEnoughBalance = useMemo(() => {
    if (
      (!validateNameAndGas.gas.value && balance.comparedTo(MIN_AMOUNT) >= 0) ||
      (validateNameAndGas.gas.value &&
        balance.comparedTo(validateNameAndGas.gas.value) >= 0)
    ) {
      return true;
    }

    return false;
  }, [balance, validateNameAndGas.gas.value]);

  const debounceValidate = debounce(async (value, curNonce) => {
    if (curNonce !== nonceRef.current) return;
    if (!address || !type) return;
    try {
      const spInfo = await selectSp();
      const provider = await connector?.getProvider();
      const offChainData = await getOffchainAuthKeys(address, provider);
      if (!offChainData) {
        alert('No offchain, please create offchain pairs first');
        return;
      }
      const bucketName = value;
      const createBucketTx = await client.bucket.createBucket(
        {
          bucketName: bucketName,
          creator: address,
          visibility: 'VISIBILITY_TYPE_PUBLIC_READ',
          chargedReadQuota: '0',
          spInfo: {
            primarySpAddress: spInfo.primarySpAddress,
          },
          paymentAddress: address,
        },
        {
          type: 'EDDSA',
          domain: domain,
          seed: offChainData.seedString,
          address,
        },
      );

      const simulateInfo = await createBucketTx.simulate({
        denom: 'BNB',
      });
      const decimalGasFee = simulateInfo?.gasFee;

      setValidateNameAndGas({
        isValidating: false,
        gas: {
          available: true,
          value: BigNumber(decimalGasFee),
        },
        name: {
          available: true,
          value: bucketName,
        },
      });
      setStatus('pending');
    } catch (e: any) {
      setStatus('failed');
    }
  }, 500);

  const simulateTx = useCallback(async () => {
    if (!address || !type) return;
    try {
      const spInfo = await selectSp();
      const provider = await connector?.getProvider();
      const offChainData = await getOffchainAuthKeys(address, provider);
      if (!offChainData) {
        console.log('No offchain, please create offchain pairs first');
        return;
      }
      const bucketName = getChannelName(address, GF_CHAIN_ID, type);
      setBucketName(bucketName);
      // create bucket
      const createBucketTx = await client.bucket.createBucket(
        {
          bucketName: bucketName,
          creator: address,
          visibility: 'VISIBILITY_TYPE_PUBLIC_READ',
          chargedReadQuota: '0',
          spInfo: {
            primarySpAddress: spInfo.primarySpAddress,
          },
          paymentAddress: address,
        },
        {
          type: 'EDDSA',
          domain: domain,
          seed: offChainData.seedString,
          address,
        },
      );
      // create group
      const groupName = generateGroupName(bucketName);
      setGroupName(groupName);
      const createGroupTx = await CreateGroup({
        creator: address as string,
        groupName: groupName,
        extra: '',
      });
      // mirror group
      const mirrorGroupTx = await mirrorGroup(
        groupName,
        '0',
        address as string,
      );
      const statement: PermissionTypes.Statement = {
        effect: PermissionTypes.Effect.EFFECT_ALLOW,
        actions: [PermissionTypes.ActionType.ACTION_GET_OBJECT],
        resources: [GRNToString(newObjectGRN(bucketName, '*'))],
      };

      const principal = {
        type: PermissionTypes.PrincipalType.PRINCIPAL_TYPE_GNFD_GROUP,
        value: GRNToString(newGroupGRN(address as string, groupName)),
      };
      const policyTx = await putBucketPolicy(bucketName, {
        operator: address,
        statements: [statement],
        principal,
      });

      const { simulate, broadcast } = await multiTx([
        createBucketTx,
        createGroupTx,
        mirrorGroupTx,
        policyTx,
      ]);

      const simulateMultiTxInfo = await simulate({
        denom: 'BNB',
      });

      setSimulateInfo(simulateMultiTxInfo);
      return { simulate, broadcast, simulateMultiTxInfo };
    } catch (e: any) {
      console.log('submit error', e);
    }
    return {};
  }, [address, type]);
  const broadcastTx = useCallback(async () => {
    if (!address || !type) return;
    let tmp = {};
    console.log('start broadcast');
    try {
      const simulateRes = await simulateTx();
      // console.log(simulateRes, 'simulateRes');
      if (!simulateRes) return;
      const { broadcast, simulateMultiTxInfo } = simulateRes;
      const res = await broadcast?.({
        denom: 'BNB',
        gasLimit: Number(simulateMultiTxInfo.gasLimit) * 2,
        gasPrice: simulateMultiTxInfo.gasPrice,
        payer: address,
        granter: '',
        signTypedDataCallback: async (addr: string, message: string) => {
          const provider = await connector?.getProvider();
          return await provider?.request({
            method: 'eth_signTypedData_v4',
            params: [addr, message],
          });
        },
      });

      const count = 60;
      const t = new Array(count).fill(1);
      let hasMirror = false;
      let groupId;
      for (const {} of t) {
        if (!groupId) {
          const groupResult = await getGroupInfo(groupName, address as string);
          groupId = groupResult?.groupInfo?.id;
          console.log(groupId, groupResult, 'loop groupId');
          continue;
        }
        if (groupId) {
          hasMirror = await OwnBuyContract(false)
            .methods.exists(Number(groupId))
            .call({ from: address });
        }

        console.log(hasMirror, 'hasMirror');

        if (hasMirror) {
          break;
        }
        await delay(1);
      }
      console.log(res, hasMirror, 'res, hasMirror');

      if (res?.code === 0 && hasMirror) {
        stateModal.modalDispatch({
          type: 'UPDATE_LIST_STATUS',
          initListStatus: 1,
          initListResult: res,
        });
      } else {
        tmp = {
          variant: res?.code !== 0 ? 'error' : 'success',
          description: res?.code !== 0 ? 'Mirror failed' : 'Mirror pending',
        };
      }
      // return res;
    } catch (e: any) {
      console.log(e);
      tmp = {
        variant: 'error',
        description: e.message ? e.message : 'Mirror failed',
      };
      setLoading(false);
    }
    // stateModal.modalDispatch({
    //   type: 'OPEN_RESULT',
    //   result: tmp,
    // });
    setLoading(false);
  }, [address, type]);

  const getGroupInfo = useCallback(
    async (groupName: string, address: string): Promise<any> => {
      const result = await getGroupInfoByName(groupName, address);
      if (!result) return null;
      return result;
    },
    [],
  );

  const checkGasFee = useCallback(
    (type: string) => {
      setValidateNameAndGas(initValidateNameAndGas);
      debounceValidate && debounceValidate.cancel();
      const curNonce = nonceRef.current + 1;
      nonceRef.current = curNonce;
      debounceValidate(type, curNonce);
    },
    [debounceValidate],
  );
  const createChannel = useCallback(async () => {
    if (address) {
      setLoading(true);
      try {
        await broadcastTx();
      } catch (error) {
        // Handle the error
      }
    }
  }, [type, address]);
  return (
    <Container
      size={'lg'}
      isOpen={isOpen}
      onClose={() => {
        onClose();
      }}
      closeOnOverlayClick={false}
    >
      <LightMode>
        <ModalCloseButton />
        <Header>Create Channel</Header>
        <ModalBody>
          <Box h={10}></Box>
          <FormControl isRequired>
            <FormLabel
              fontWeight={500}
              mb={8}
              fontSize={16}
              fontFamily={'heading'}
            >
              Type
            </FormLabel>
            <RadioGroup
              value={type}
              onChange={(e) => {
                if (!e) return;
                setType(e.toString());
                checkGasFee(e.toString());
              }}
            >
              <HStack alignItems="flex-start" spacing={24}>
                <Radio
                  value="private"
                  isDisabled={channelType?.includes('private')}
                >
                  Private
                </Radio>
                <Radio
                  value="public"
                  isDisabled={channelType?.includes('public')}
                >
                  Public
                </Radio>
              </HStack>
            </RadioGroup>
            <FormErrorMessage>Type is required.</FormErrorMessage>
          </FormControl>
          <FeeCon flexDirection={'column'} justifyContent={'space-between'}>
            <BottomInfo>
              <Item alignItems={'center'} justifyContent={'space-between'}>
                <ItemSubTittle>
                  Gas fee to create{' '}
                  <ColoredWarningIcon size="sm" color="#AEB4BC" />
                </ItemSubTittle>
                <BalanceCon flexDirection={'column'} alignItems={'flex-end'}>
                  <>
                    <Fee>
                      {validateNameAndGas?.gas.value?.dp(8).toString() || '-'}{' '}
                      BNB
                    </Fee>

                    {!validateNameAndGas.isValidating ? (
                      <Balance>
                        Greenfield Balance: {roundFun(GfBalanceVal, 8)} BNB{' '}
                      </Balance>
                    ) : (
                      <BalanceWarn
                        gap={5}
                        alignItems={'center'}
                        justifyContent={'center'}
                      >
                        <ColoredWarningIcon size="sm" color="#ff6058" />{' '}
                        Insufficient Greenfield Balance
                      </BalanceWarn>
                    )}
                  </>
                </BalanceCon>
              </Item>
            </BottomInfo>
          </FeeCon>
        </ModalBody>
        <ModalFooter>
          <HStack w="100%" spacing={20}>
            {chain && chain.id == GF_CHAIN_ID && (
              <Button
                w="100%"
                variant="brand"
                onClick={() => createChannel()}
                disabled={disableCreateButton()}
                justifyContent="center"
              >
                {loading ? (
                  <Loader
                    style={{ width: '32px' }}
                    size={32}
                    minHeight={32}
                  ></Loader>
                ) : (
                  'Create'
                )}
              </Button>
            )}
            {chain && chain.id !== GF_CHAIN_ID ? (
              <Button
                width={'100%'}
                onClick={async () => {
                  switchNetwork?.(GF_CHAIN_ID);
                }}
              >
                Switch to Greenfield
              </Button>
            ) : null}
          </HStack>
        </ModalFooter>
      </LightMode>
    </Container>
  );
};

const Container = styled(Modal)`
  .ui-modal-content {
    background: #ffffff;
  }
`;
const Header = styled(ModalHeader)`
  font-style: normal;
  font-weight: 700;
  font-size: 20px;
  line-height: 28px;

  display: flex;
  align-items: center;
  text-align: center;

  color: #000000;
`;

const CustomBody = styled(ModalBody)`
  height: 380px;
`;

const ItemTittle = styled(Flex)`
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 18px;

  color: #1e2026;

  span {
    color: #76808f;
  }
`;

const ResourceNameCon = styled(Flex)`
  font-style: normal;
  font-weight: 700;
  font-size: 20px;
  line-height: 28px;

  color: #000000;
`;

const Tag = styled(Flex)`
  margin-left: 16px;

  font-style: normal;
  font-weight: 400;
  font-size: 8px;
  line-height: 28px;

  width: 73px;
  height: 16px;

  background: #d9d9d9;

  border-radius: 16px;
`;

const InputCon = styled.div`
  .ui-input,
  .ui-textarea {
    background: #ffffff;
    /* readable/border */

    border: 1px solid #e6e8ea;
    border-radius: 8px;
    color: #aeb4bc;
  }
`;
const FeeCon = styled(Flex)`
  padding: 16px;
  margin-top: 20px;

  width: 100%;
  height: 75px;

  border: 1px solid #e6e8ea;
  border-radius: 8px;
`;

const BottomInfo = styled.div``;
const Item = styled(Flex)`
  height: 40px;
`;
const ItemSubTittle = styled.div`
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 18px;
  color: #1e2026;
`;

const BalanceCon = styled(Flex)``;

const Fee = styled.div`
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 18px;

  color: #1e2026;
`;

const Balance = styled.div`
  text-align: right;

  font-style: normal;
  font-weight: 400;
  font-size: 10px;
  line-height: 18px;

  color: #696a6c;
`;

const BalanceWarn = styled(Flex)`
  font-style: normal;
  font-weight: 700;
  font-size: 10px;
  line-height: 18px;
  /* identical to box height, or 180% */

  color: #ff6058;
`;

const FooterCon = styled(Flex)`
  width: 100%;
`;
