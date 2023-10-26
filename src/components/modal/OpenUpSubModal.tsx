import styled from '@emotion/styled';
import { ColoredWarningIcon } from '@totejs/icons';
import {
  Box,
  Flex,
  Input,
  toast,
  Textarea,
  FormControl,
  FormLabel,
  FormErrorMessage,
  LightMode,
} from '@totejs/uikit';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
} from '@totejs/uikit';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useAccount, useNetwork, useSwitchNetwork } from 'wagmi';
import {
  BSC_CHAIN_ID,
  LIST_ESTIMATE_FEE_ON_BSC,
  BSC_SEND_GAS_FEE,
} from '../../env';
import { useChainBalance } from '../../hooks/useChainBalance';
import { roundFun } from '../../utils';
import { useModal } from '../../hooks/useModal';
import { MindStreamContract } from '../../base/contract/mindStreamContract';
import Web3 from 'web3';
import { useUserSetting } from '../../hooks/useUserSetting';

interface SubModalProps {
  isOpen: boolean;
  handleOpen: (show: boolean) => void;
  updateFn?: () => void;
  type: 'OPEN_UP' | 'SET_PRICE';
}
interface PriceData {
  month: number | '';
  threeMonths: number | '';
  year: number | '';
}

export const OpenSubModal = (props: SubModalProps) => {
  const { isOpen, handleOpen, type } = props;

  const [loading, setLoading] = useState(false);
  const modalData = useModal();
  const { activeGroup } = modalData.modalState;
  const [error, setError] = useState('');
  const { groupId } = activeGroup;

  const { currentUserPrices, loading: userSettingLoading } = useUserSetting();

  const { switchNetwork } = useSwitchNetwork();
  const { BscBalanceVal } = useChainBalance();
  const { chain } = useNetwork();
  const { address } = useAccount();

  const [prices, setPrices] = useState<PriceData>({
    month: '',
    threeMonths: '',
    year: '',
  });
  useEffect(() => {
    if (userSettingLoading) return;
    console.log(currentUserPrices, 'currentUserPrices');
    if (currentUserPrices && currentUserPrices.length > 0) {
      setPrices({
        month: Number(Web3.utils.fromWei(currentUserPrices[0], 'ether')),
        threeMonths: Number(Web3.utils.fromWei(currentUserPrices[1], 'ether')),
        year: Number(Web3.utils.fromWei(currentUserPrices[2], 'ether')),
      });
    }
  }, [currentUserPrices, userSettingLoading]);

  const handleConfirm = useCallback(async () => {
    if (groupId) {
      setLoading(true);
      const price = Object.values(prices);
      const params = price.map((item) =>
        Web3.utils.toWei(item.toString(), 'ether'),
      );
      let result;
      if (type === 'OPEN_UP') {
        result = await MindStreamContract(true)
          .methods.openUpSubscribeChannel(groupId, params)
          .send({ from: address, gasPrice: BSC_SEND_GAS_FEE });
      } else {
        result = await MindStreamContract(true)
          .methods.setPrice(params)
          .send({ from: address, gasPrice: BSC_SEND_GAS_FEE });
      }

      if (result) {
        setLoading(false);
        reset();
        toast.success({ description: 'Open Up Subscribe Success' });
        return result;
      }
    }
  }, [prices]);

  const handlePriceChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: keyof PriceData,
  ) => {
    setLoading(true);
    setError('');
    setPrices((prevPrices) => ({
      ...prevPrices,
      [type]: Number(event.target.value),
    }));
    setLoading(false);
  };
  const handleSubmit = () => {
    // Validate that all prices are provided
    const { month, threeMonths, year } = prices;

    if (month === 0 || threeMonths === 0 || year === 0) {
      console.log(month, threeMonths, year);

      setError('Please provide all prices, and prices cannot be 0');
      // reset();
      return;
    }

    // Perform your desired logic with the prices
    console.log('Prices:', prices);

    // Close the modal
    handleConfirm();
  };
  const BSC_FEE_SUFF = useMemo(() => {
    return BscBalanceVal >= LIST_ESTIMATE_FEE_ON_BSC;
  }, [BscBalanceVal]);

  //subscribe charge 1 month, 3 months, and 1 year at different prices.

  const reset = useCallback(() => {
    handleOpen(false);
    setPrices({
      month: '',
      threeMonths: '',
      year: '',
    });
    setError('');
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
      <Header>{type === 'OPEN_UP' ? 'Open Up Subscribe' : 'Set Price'}</Header>
      <CustomBody>
        {/* <Box h={10}></Box> */}
        {/* <ItemTittle alignItems={'center'} justifyContent={'space-between'}>
          Channel Name
        </ItemTittle> */}
        <FormControl my={24} isInvalid={error?.length > 0}>
          <LightMode>
            <Flex alignItems={'center'}>
              <FormLabel
                htmlFor="month-price"
                whiteSpace={'nowrap'}
                mr={10}
                w={120}
              >
                1 Month Price:
              </FormLabel>
              <Input
                my={10}
                type="number"
                value={prices.month}
                onChange={(event) => handlePriceChange(event, 'month')}
                required
              />
              BNB
            </Flex>
            <Flex alignItems={'center'}>
              <FormLabel
                htmlFor="three-months-price"
                whiteSpace={'nowrap'}
                mr={10}
                w={120}
              >
                3 Months Price:
              </FormLabel>
              <Input
                my={10}
                type="number"
                value={prices.threeMonths}
                onChange={(event) => handlePriceChange(event, 'threeMonths')}
                required
              />
              BNB
            </Flex>
            <Flex alignItems={'center'}>
              <FormLabel
                htmlFor="year-price"
                whiteSpace={'nowrap'}
                mr={10}
                w={120}
              >
                1 Year Price:
              </FormLabel>
              <Input
                my={10}
                type="number"
                value={prices.year}
                onChange={(event) => handlePriceChange(event, 'year')}
                required
              />
              BNB
            </Flex>
            {error && <FormErrorMessage>{error}</FormErrorMessage>}
          </LightMode>
        </FormControl>
        <FeeCon flexDirection={'column'} justifyContent={'space-between'}>
          <BottomInfo>
            <Item alignItems={'center'} justifyContent={'space-between'}>
              <ItemSubTittle>
                Gas fee to set price{' '}
                <ColoredWarningIcon size="sm" color="#AEB4BC" />
              </ItemSubTittle>
              <Item alignItems={'center'} justifyContent={'space-between'}>
                <ItemSubTittle>
                  Estimate gas fee on BSC{' '}
                  <ColoredWarningIcon size="sm" color="#AEB4BC" />
                </ItemSubTittle>
                <BalanceCon flexDirection={'column'} alignItems={'flex-end'}>
                  <Fee>{LIST_ESTIMATE_FEE_ON_BSC} BNB</Fee>
                  {BSC_FEE_SUFF ? (
                    <Balance>
                      BSC Balance: {roundFun(BscBalanceVal, 8)} BNB{' '}
                    </Balance>
                  ) : (
                    <BalanceWarn>
                      <ColoredWarningIcon size="sm" color="#ff6058" />{' '}
                      Insufficient BSC Balance
                    </BalanceWarn>
                  )}
                </BalanceCon>
              </Item>
            </Item>
          </BottomInfo>
        </FeeCon>
      </CustomBody>
      <ModalFooter>
        <FooterCon flexDirection={'column'} gap={6}>
          {chain && chain.id === BSC_CHAIN_ID && (
            <Button
              width={'100%'}
              onClick={() => {
                handleSubmit();
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
