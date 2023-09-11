import styled from '@emotion/styled';
import { ColoredWarningIcon } from '@totejs/icons';
import {
  Box,
  Flex,
  Input,
  FormControl,
  FormLabel,
  LightMode,
} from '@totejs/uikit';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  RadioGroup,
  Radio,
  HStack,
} from '@totejs/uikit';
import { useMemo, useState, useCallback } from 'react';
import { useAccount, useNetwork, useSwitchNetwork } from 'wagmi';
import {
  BSC_CHAIN_ID,
  LIST_ESTIMATE_FEE_ON_BSC,
  BSC_SEND_GAS_FEE,
} from '../../env';
import { useChainBalance } from '../../hooks/useChainBalance';
import { useEdit } from '../../hooks/useEdit';
import { Loader } from '../Loader';
import { roundFun, divide10Exp } from '../../utils';
import { useModal } from '../../hooks/useModal';
import { MindStreamContract } from '../../base/contract/mindStreamContract';
import { useBuy } from '../../hooks/useBuy';
import { useAsyncEffect } from 'ahooks';
import { BN } from 'bn.js';

interface SubModalProps {
  isOpen: boolean;
  handleOpen: (show: boolean) => void;
}
enum SubType {
  OneMonth,
  ThreeMonths,
  OneYear,
}

export const SubscribeModal = (props: SubModalProps) => {
  const { isOpen, handleOpen } = props;

  const [loading, setLoading] = useState(false);
  const modalData = useModal();
  const { subItem }: { subItem: any } = modalData.modalState;
  const [subType, setSubType] = useState<string>('');
  const [price, setPrice] = useState<string>('');

  const { BucketInfo, groupId } = subItem;
  const { BucketName: bucketName, Owner: ownerAddress } = BucketInfo;

  const { switchNetwork } = useSwitchNetwork();
  const { BscBalanceVal } = useChainBalance();
  const { chain } = useNetwork();
  const { address } = useAccount();
  const { buy, relayFee } = useBuy('', ownerAddress, address as string);

  const onClose = () => {
    reset();
    handleOpen(false);
  };
  const getUsersInfo = useCallback(async () => {
    if (ownerAddress) {
      setLoading(true);
      const result = await MindStreamContract(false)
        .methods.getUsersInfo(ownerAddress)
        .call();
      console.log(result);

      if (result) {
        return result;
      }
    }
  }, [ownerAddress]);
  useAsyncEffect(async () => {
    // const userInfo = await getUsersInfo();
  }, []);
  const handleConfirm = useCallback(async () => {
    if (groupId) {
      setLoading(true);
      // const result = await MindStreamContract(false)
      //   .methods.subscribeOrRenew(ownerAddress, subType)
      //   .send({ from: address, gasPrice: relayFee });
      // if (result > 0) {
      //   console.log(result);
      //   return result;
      // }
    }
  }, []);
  const handleTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const type = event.target.value;
    setSubType(type);
  };

  const relayFeeBNB = useMemo(() => {
    const balance = divide10Exp(new BN(relayFee, 10), 18);
    return balance;
  }, [relayFee]);

  const priceBNB = useMemo(() => {
    const balance = divide10Exp(new BN(price, 10), 18);
    return balance;
  }, [price]);

  const earing = useMemo(() => {
    return Number(priceBNB) * 0.01;
  }, [priceBNB]);
  const TotalPrice = useMemo(() => {
    return roundFun(Number(priceBNB) + Number(earing) + Number(relayFeeBNB), 6);
  }, [earing, priceBNB, relayFeeBNB]);

  const handleSubmit = (event: any) => {
    event.preventDefault();

    // Close the modal
    onClose();
  };
  const BSC_FEE_SUFF = useMemo(() => {
    return BscBalanceVal >= LIST_ESTIMATE_FEE_ON_BSC;
  }, [BscBalanceVal]);

  //subscribe charge 1 month, 3 months, and 1 year at different prices.

  const reset = useCallback(() => {
    setSubType('');
  }, []);

  return (
    <Container
      size={'lg'}
      isOpen={isOpen}
      onClose={() => {
        handleOpen(false);
      }}
      closeOnOverlayClick={false}
    >
      <ModalCloseButton />
      <Header>Open Up Subscribe</Header>
      <CustomBody>
        <Box h={10}></Box>
        <ItemTittle alignItems={'center'} justifyContent={'space-between'}>
          Channel Name
          <span>{bucketName}</span>
        </ItemTittle>
        <FormControl onSubmit={handleSubmit} my={24}>
          <LightMode>
            <RadioGroup
              onChange={(e) => {
                if (!e) return;
                setSubType(e.toString());
              }}
            >
              <HStack alignItems="flex-start" spacing={24}>
                <Radio value={SubType.OneMonth}>One Month</Radio>
                <Radio value={SubType.ThreeMonths}>Three Months</Radio>
                <Radio value={SubType.OneYear}>One Year</Radio>
              </HStack>
            </RadioGroup>
          </LightMode>
        </FormControl>
        <FeeCon flexDirection={'column'} justifyContent={'space-between'}>
          <BottomInfo>
            <Box>
              <ItemCon justifyContent={'space-between'}>
                <ItemTitle>Gas fee</ItemTitle>
                <ItemVal>{relayFeeBNB} BNB</ItemVal>
              </ItemCon>
              <ItemCon justifyContent={'space-between'}>
                <ItemTitle>Service fee</ItemTitle>
                <ItemVal>1%</ItemVal>
              </ItemCon>
              <Box h={6}></Box>
              <Box h={1} border={'0.1px #181a1e solid'}></Box>
              <Box h={6}></Box>
              <ItemCon alignItems={'flex-end'} justifyContent={'space-between'}>
                <ItemTitle>Total</ItemTitle>
                <ItemVal> {TotalPrice} BNB </ItemVal>
              </ItemCon>
              <ItemCon alignItems={'flex-end'} justifyContent={'space-between'}>
                <ItemTitle>Balance on BSC Testnet</ItemTitle>
                <ItemVal> {roundFun(BscBalanceVal, 4)} BNB </ItemVal>
              </ItemCon>
            </Box>
          </BottomInfo>
        </FeeCon>
      </CustomBody>
      <ModalFooter>
        <FooterCon flexDirection={'column'} gap={6}>
          {chain && chain.id === BSC_CHAIN_ID && (
            <Button
              width={'100%'}
              onClick={() => {
                handleConfirm();
              }}
              disabled={!BSC_FEE_SUFF || loading}
              isLoading={loading}
            >
              Confirm
            </Button>
          )}
          {chain && chain.id !== BSC_CHAIN_ID ? (
            <Button
              width={'100%'}
              onClick={async () => {
                switchNetwork?.(BSC_CHAIN_ID);
              }}
            >
              Switch to BSC Testnet
            </Button>
          ) : null}
        </FooterCon>
      </ModalFooter>
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
  height: 100%;
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

const ItemCon = styled(Flex)``;

const FeeCon = styled(Flex)`
  padding: 16px;

  width: 100%;

  border: 1px solid #e6e8ea;
  border-radius: 8px;
`;

const BottomInfo = styled.div``;

const BuyInfo = styled.div`
  margin-top: 60px;
`;

const FooterCon = styled(Flex)`
  width: 100%;
`;
const ItemTitle = styled.div`
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 18px;

  color: #1e2026;
`;

const ItemVal = styled.div`
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 18px;

  color: #1e2026;
`;

const BalanceWarn = styled(Flex)`
  position: absolute;

  font-style: normal;
  font-weight: 700;
  font-size: 10px;
  line-height: 18px;
  /* identical to box height, or 180% */
  bottom: 90px;
  color: #ff6058;
`;
