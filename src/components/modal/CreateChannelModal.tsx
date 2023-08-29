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
import { useAccount, useNetwork, useSwitchNetwork, useBalance } from 'wagmi';
import { GF_CHAIN_ID, BSC_CHAIN_ID } from '../../env';
import { useChainBalance } from '../../hooks/useChainBalance';
import { Loader } from '../Loader';
import { defaultImg, divide10Exp, roundFun } from '../../utils';
import { getDomain } from '../../utils/getDomain';
import { BN } from 'bn.js';
import { useBuy } from '../../hooks/useBuy';
import { debounce, isEmpty } from 'lodash-es';
import BigNumber from 'bignumber.js';
import { useChannelList } from '../../hooks/useChannelList';
import { useSP } from '../../hooks/useSP';
import { useOffChainAuth } from '../../hooks/useOffChainAuth';
import { selectSp, client, getAllSps } from '../../utils/gfSDK';
import {
  getSpOffChainData,
  getOffchainAuthKeys,
} from '../../utils/off-chain-auth';
import { getChannelName } from '../../utils/string';
import { set } from 'date-fns';

interface ListModalProps {
  isOpen: boolean;
  handleOpen: (show: boolean) => void;
  // detail: any;
  // updateFn: () => void;
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
  const nonceRef = useRef(0);

  const [type, setType] = useState<string>();
  const { address, connector } = useAccount();
  const { GfBalanceVal } = useChainBalance();
  const { switchNetwork } = useSwitchNetwork();
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
  const { channelType } = useChannelList();
  const { oneSp } = useSP();
  const domain = getDomain();
  const debounceValidate = debounce(async (value, curNonce) => {
    if (curNonce !== nonceRef.current) return;
    if (!address || !oneSp || !type) return;

    const types: { [key: string]: string } = {};
    try {
      const sps = await getAllSps();
      const spInfo = sps.filter((item) => item.endpoint === oneSp)[0];
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
            primarySpAddress: spInfo.address,
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
    console.log(validateNameAndGas, status);
  }, 500);
  const createBucket = async () => {
    if (!address || !oneSp || !type) return;
    try {
      const sps = await getAllSps();
      const spInfo = sps.filter((item) => item.endpoint === oneSp)[0];
      const provider = await connector?.getProvider();
      const offChainData = await getOffchainAuthKeys(address, provider);
      if (!offChainData) {
        alert('No offchain, please create offchain pairs first');
        return;
      }
      const bucketName = getChannelName(address, GF_CHAIN_ID, type);
      console.log(offChainData, 'offchaindata', bucketName, 'bucketName');
      const createBucketTx = await client.bucket.createBucket(
        {
          bucketName: bucketName,
          creator: address,
          visibility: 'VISIBILITY_TYPE_PUBLIC_READ',
          chargedReadQuota: '0',
          spInfo: {
            primarySpAddress: spInfo.address,
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
      const res = await createBucketTx.broadcast({
        denom: 'BNB',
        gasLimit: Number(simulateInfo?.gasLimit),
        gasPrice: simulateInfo?.gasPrice || '5000000000',
        payer: address,
        granter: '',
      });

      if (res.code === 0) {
        toast.success({
          description: `Bucket created successfully!`,
        });
        setTimeout(() => {
          setStatus('pending');
          handleOpen(false);
        }, 200);
      } else {
        toast.error({
          description: `Bucket created failed!`,
        });
      }
      setLoading(false);
    } catch (e: any) {
      setStatus('failed');
      console.log('submit error', e);
      setStatus('pending');
    }
  };
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
                  {/* {status === 'operating' ? (
                    <Loader size={24}></Loader>
                  ) : ( */}
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
                  {/* )} */}
                </BalanceCon>
              </Item>
            </BottomInfo>
          </FeeCon>
        </ModalBody>
        <ModalFooter>
          <HStack w="100%" spacing={20}>
            <Button
              w="100%"
              variant="brand"
              onClick={() => createBucket()}
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
