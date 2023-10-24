import styled from '@emotion/styled';
import { ColoredWarningIcon } from '@totejs/icons';
import {
  Box,
  Flex,
  Input,
  FormControl,
  FormLabel,
  LightMode,
  VStack,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  RadioGroup,
  Radio,
} from '@totejs/uikit';
import { useMemo, useState, useCallback } from 'react';
import { useAccount, useNetwork, useSwitchNetwork } from 'wagmi';
import { BSC_CHAIN_ID, LIST_ESTIMATE_FEE_ON_BSC } from '../../env';
import { useUserSetting } from '../..//hooks/useUserSetting';
import { useSubscribe } from '../..//hooks/useSubscribe';
import { useChainBalance } from '../../hooks/useChainBalance';
import { roundFun, divide10Exp } from '../../utils';
import { useModal } from '../../hooks/useModal';
import { useBuy } from '../../hooks/useBuy';
import { useAsyncEffect } from 'ahooks';
import { BN } from 'bn.js';
interface SubModalProps {
  isOpen: boolean;
  handleOpen: (show: boolean) => void;
}
enum TypesOfSubscriptions {
  OneMonth = 0,
  ThreeMonths = 1,
  OneYear = 2,
}

export const SubscribeModal = (props: SubModalProps) => {
  const { isOpen, handleOpen } = props;
  const modalData = useModal();

  const [loading, setLoading] = useState(false);
  const { subItem }: { subItem: any } = modalData.modalState;
  const [subType, setSubType] = useState<number | null>(null);
  const [price, setPrice] = useState<string>('');
  const [prices, setPrices] = useState<string[]>([]);
  const { getSubPrice } = useUserSetting();

  const { groupId, groupName, ownerAddress } = subItem;
  // const { BucketName: bucketName, Owner: ownerAddress } = BucketInfo;

  const { subscribe } = useSubscribe(groupName, ownerAddress);

  const { switchNetwork } = useSwitchNetwork();
  const { BscBalanceVal } = useChainBalance();
  const { chain } = useNetwork();
  const { address } = useAccount();
  const { relayFee } = useBuy('', ownerAddress, address as string);

  useAsyncEffect(async () => {
    if (ownerAddress) {
      const result = await getSubPrice(ownerAddress);
      setPrices(result);
    }
  }, [ownerAddress]);

  const handleConfirm = useCallback(async () => {
    if (ownerAddress && price && subType !== null) {
      setLoading(true);
      //groupId: number,price: string,subType: 0 | 1 | 2, ownerAddress: string,
      await subscribe(groupId, price, subType);
      reset();
      setLoading(false);
    }
  }, [ownerAddress, subType, price]);

  const relayFeeBNB = useMemo(() => {
    const balance = divide10Exp(new BN(relayFee, 10), 18);
    return balance;
  }, [relayFee]);

  const priceBNB = useMemo(() => {
    const balance = divide10Exp(new BN(price, 10), 18);
    return balance;
  }, [price]);

  //todo is service fee needed ?
  const earing = useMemo(() => {
    return Number(priceBNB) * 0.01;
  }, [priceBNB]);

  const TotalPrice = useMemo(() => {
    return roundFun(Number(priceBNB) + Number(earing) + Number(relayFeeBNB), 6);
  }, [earing, priceBNB, relayFeeBNB]);

  const BSC_FEE_SUFF = useMemo(() => {
    return BscBalanceVal >= LIST_ESTIMATE_FEE_ON_BSC;
  }, [BscBalanceVal]);

  //subscribe charge 1 month, 3 months, and 1 year at different prices.

  const reset = useCallback(() => {
    setSubType(null);
    handleOpen(false);
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
      <Header>Subscribe</Header>
      <CustomBody>
        <Box h={10}></Box>
        {/* <ItemTittle alignItems={'center'}>
          Channel Name:
          <Box ml={10}>{bucketName}</Box>
        </ItemTittle> */}
        <ItemTittle alignItems={'center'} mt={10}>
          Owner:
          <Box ml={10}>{ownerAddress}</Box>
        </ItemTittle>
        <FormControl my={24}>
          <LightMode>
            <RadioGroup
              onChange={(e) => {
                if (!e) return;
                const subType = e.toString();
                const subscriptionValue: number =
                  TypesOfSubscriptions[
                    subType as keyof typeof TypesOfSubscriptions
                  ];
                setSubType(subscriptionValue);
                setPrice(prices[subscriptionValue]);
              }}
            >
              <VStack alignItems="flex-start" spacing={24} fontSize={16}>
                <Flex>
                  <Radio value={'OneMonth'}>One Month</Radio>{' '}
                  <Box ml={20} color="scene.primary.normal" fontWeight={500}>
                    {divide10Exp(new BN(prices[0], 10), 18)} BNB
                  </Box>
                </Flex>
                <Flex>
                  <Radio value={'ThreeMonths'}>Three Months</Radio>
                  <Box ml={20} color="scene.primary.normal" fontWeight={500}>
                    {divide10Exp(new BN(prices[1], 10), 18)} BNB
                  </Box>
                </Flex>
                <Flex>
                  <Radio value={'OneYear'}>One Year</Radio>
                  <Box ml={20} color="scene.primary.normal" fontWeight={500}>
                    {divide10Exp(new BN(prices[2], 10), 18)} BNB
                  </Box>
                </Flex>
              </VStack>
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
  font-size: 16px;
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
