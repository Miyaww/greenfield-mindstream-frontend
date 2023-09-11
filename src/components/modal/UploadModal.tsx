import styled from '@emotion/styled';
import { ColoredWarningIcon } from '@totejs/icons';
import { Box, Flex } from '@totejs/uikit';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
} from '@totejs/uikit';
import { useCallback, useMemo, useEffect } from 'react';
import { useNetwork, useSwitchNetwork } from 'wagmi';
import { GF_CHAIN_ID, LIST_FEE_ON_GF } from '../../env';
import { useChainBalance } from '../../hooks/useChainBalance';
import { roundFun } from '../../utils';
import { Loader } from '../Loader';
import { useUpload } from '../../hooks/useUpload';

interface UploadModalProps {
  isOpen: boolean;
  handleOpen: (show: boolean) => void;
  detail: any;
}

export const UploadModal = (props: UploadModalProps) => {
  const { isOpen, handleOpen, detail } = props;
  const { pending, handleUploadFile, simulateInfo, simulateTx, simloading } =
    useUpload();
  const { bucket_name, object_name, file } = detail;
  const fileName = object_name;
  const channelType = bucket_name.includes('public') ? 'public' : 'private';

  const { switchNetwork } = useSwitchNetwork();
  const { GfBalanceVal } = useChainBalance();

  const { chain } = useNetwork();

  const GF_FEE_SUFF = useMemo(() => {
    return GfBalanceVal >= LIST_FEE_ON_GF;
  }, [GfBalanceVal]);
  useEffect(() => {
    if (!isOpen) return;
    simulateTx(file, bucket_name, fileName);
  }, [isOpen]);
  const reset = useCallback(() => {
    handleOpen(false);
  }, []);

  const available = useMemo(() => {
    return GF_FEE_SUFF && !pending && !simloading;
  }, [GF_FEE_SUFF, pending, simloading]);

  return (
    <Container
      size={'lg'}
      isOpen={isOpen}
      onClose={() => {
        reset();
      }}
      closeOnOverlayClick={false}
    >
      <ModalCloseButton />
      <Header>Uploading File</Header>
      <CustomBody>
        <Box h={10}></Box>
        <InfoCon gap={26} justifyContent={'center'} alignItems={'center'}>
          <BaseInfo flexDirection={'column'} alignItems={'flex-start'}>
            <ItemSubTittle>File Name</ItemSubTittle>
            {fileName && (
              <ResourceNameCon alignItems={'center'}>
                {fileName}
              </ResourceNameCon>
            )}
            <ItemSubTittle>Channel Name</ItemSubTittle>
            {bucket_name && (
              <ResourceNameCon alignItems={'center'}>
                {bucket_name}
              </ResourceNameCon>
            )}
            <ItemSubTittle>Channel Type</ItemSubTittle>
            {channelType && (
              <ResourceNameCon alignItems={'center'}>
                {channelType}
              </ResourceNameCon>
            )}
          </BaseInfo>
        </InfoCon>
        <Box h={10}></Box>
        <FeeCon flexDirection={'column'} justifyContent={'space-between'}>
          <BottomInfo>
            <Item alignItems={'center'} justifyContent={'space-between'}>
              <ItemSubTittle>
                Gas fee on Greenfield{' '}
                <ColoredWarningIcon size="sm" color="#AEB4BC" />
              </ItemSubTittle>
              {simloading ? (
                <Loader
                  style={{ width: '32px' }}
                  size={32}
                  minHeight={32}
                ></Loader>
              ) : (
                <BalanceCon flexDirection={'column'} alignItems={'flex-end'}>
                  <Fee>{simulateInfo?.gasFee} BNB</Fee>
                  {GF_FEE_SUFF ? (
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
                </BalanceCon>
              )}
            </Item>
          </BottomInfo>
        </FeeCon>
      </CustomBody>
      <ModalFooter>
        <FooterCon flexDirection={'column'} gap={6}>
          {chain && chain.id === GF_CHAIN_ID && (
            <Button
              width={'100%'}
              onClick={async () => {
                const res = await handleUploadFile(file, bucket_name, fileName);
                if (!pending && res) {
                  reset();
                }
              }}
              disabled={!available}
            >
              Upload File
            </Button>
          )}
          {chain && chain.id !== GF_CHAIN_ID ? (
            <Button
              width={'100%'}
              onClick={async () => {
                switchNetwork?.(GF_CHAIN_ID);
              }}
            >
              Switch to Greenfield to Start
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
  height: 530px;
`;

const BaseInfo = styled(Flex)`
  width: 100%;
`;

const ResourceNameCon = styled(Flex)`
  font-style: normal;
  font-weight: 700;
  font-size: 20px;
  line-height: 28px;
  margin-bottom: 12px;

  color: #5f6368;
`;

const FeeCon = styled(Flex)`
  padding: 16px;

  width: 100%;
  height: 115px;

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
  color: #aeb4bc;
`;

const BalanceCon = styled(Flex)``;

const Fee = styled.div`
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 18px;
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
const InfoCon = styled(Flex)`
  width: 100%;
`;
