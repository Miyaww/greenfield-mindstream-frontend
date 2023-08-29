import styled from '@emotion/styled';
import { ColoredWarningIcon } from '@totejs/icons';
import { Box, Flex, Input, toast } from '@totejs/uikit';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Textarea,
} from '@totejs/uikit';
import { useCallback, useMemo, useState, useEffect } from 'react';
import { useNetwork, useSwitchNetwork } from 'wagmi';
import { BSC_CHAIN_ID, LIST_ESTIMATE_FEE_ON_BSC } from '../../env';
import { useChainBalance } from '../../hooks/useChainBalance';
import { defaultImg, roundFun } from '../../utils';
import { useProfile } from '../../hooks/useProfile';
import Logo from '../../images/logo.png';
import { useDebounce } from '../../hooks/useDebounce';

interface ListModalProps {
  isOpen: boolean;
  handleOpen: (show: boolean) => void;
  detail: any;
}

export const ProfileModal = (props: ListModalProps) => {
  const { isOpen, handleOpen, detail } = props;
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [imgUrl, setImgUrl] = useState('');

  const [_name, _setName] = useState('');
  const [_desc, _setDesc] = useState('');
  const [_imgUrl, _setImgUrl] = useState('');

  const { switchNetwork } = useSwitchNetwork();
  const { GfBalanceVal, BscBalanceVal } = useChainBalance();

  const { chain } = useNetwork();
  const { updateUserProfile } = useProfile();

  const setValue = useDebounce(async (fn: any, val: string) => {
    fn?.(val);
  }, 500);
  useEffect(() => {
    detail?.name && _setName(detail?.name);
    detail?.avatar && _setImgUrl(detail?.avatar);
    detail?.bio && _setDesc(detail?.bio);
  }, [detail]);

  const onChangeName = (event: any) => {
    _setName(event.target.value);
    setValue(setName, event.target.value);
  };
  const onChangeDesc = (event: any) => {
    _setDesc(event.target.value);
    setValue(setDesc, event.target.value);
  };
  const onChangeImgUrl = (event: any) => {
    _setImgUrl(event.target.value);
    setValue(setImgUrl, event.target.value);
  };

  const BSC_FEE_SUFF = useMemo(() => {
    return BscBalanceVal >= LIST_ESTIMATE_FEE_ON_BSC;
  }, [GfBalanceVal]);

  const reset = useCallback(() => {
    setName('');
    setDesc('');
    setImgUrl('');
    handleOpen(false);
  }, []);

  const available = useMemo(() => {
    return BSC_FEE_SUFF && !loading;
  }, [BSC_FEE_SUFF, loading]);

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
      <Header>User Profile</Header>
      <CustomBody>
        <Box h={10}></Box>
        <InfoCon gap={26} justifyContent={'center'} alignItems={'center'}>
          <ImgCon>
            <img src={_imgUrl ? _imgUrl : defaultImg(name, 80)} alt="" />
          </ImgCon>
        </InfoCon>
        <Box h={10}></Box>
        <ItemTittle className="require">Name</ItemTittle>
        <Box h={10}></Box>
        <InputCon>
          <Input
            value={_name}
            onChange={onChangeName}
            placeholder="Please enter name..."
            type="string"
            // isInvalid={waringPrice}
          ></Input>
        </InputCon>
        <Box h={10}></Box>
        <ItemTittle alignItems={'center'} justifyContent={'space-between'}>
          description
          <span>
            Markdown syntax is supported. {desc.length} of 300 characters used.
          </span>
        </ItemTittle>
        <Box h={10}></Box>
        <InputCon>
          <Textarea
            value={_desc}
            onChange={onChangeDesc}
            placeholder="Please enter an description..."
            maxLength={300}
          />
        </InputCon>
        <Box h={10}></Box>
        <ItemTittle className="require">Avatar</ItemTittle>
        <InputCon>
          <Input
            value={_imgUrl}
            onChange={onChangeImgUrl}
            placeholder="Please enter an url..."
          ></Input>
        </InputCon>
        <Box h={32}></Box>
        <FeeCon flexDirection={'column'} justifyContent={'space-between'}>
          <BottomInfo>
            {/* <Item alignItems={'center'} justifyContent={'space-between'}>
              <ItemSubTittle>
                Gas fee on Greenfield{' '}
                <ColoredWarningIcon size="sm" color="#AEB4BC" />
              </ItemSubTittle>
              {loading ? (
                <Loader
                  style={{ width: '32px' }}
                  size={32}
                  minHeight={32}
                ></Loader>
              ) : (
                <BalanceCon flexDirection={'column'} alignItems={'flex-end'}>
                  <Fee>{simulateInfo?.gasFee || INITIATE_LIST_FEE} BNB</Fee>
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
            </Item> */}
            <LineBox h={0.1}></LineBox>
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
          </BottomInfo>
        </FeeCon>
      </CustomBody>
      <ModalFooter>
        <FooterCon flexDirection={'column'} gap={6}>
          {chain && chain.id === BSC_CHAIN_ID && (
            <Button
              width={'100%'}
              onClick={async () => {
                setLoading(true);
                const res = await updateUserProfile({
                  _name: name,
                  _avatar: imgUrl,
                  _bio: desc,
                });
                if (res.status) {
                  setLoading(false);
                  reset();
                  toast.success({ description: 'Update Success' });
                } else {
                  reset();
                  setLoading(false);
                }
              }}
              disabled={!available}
            >
              Update Profile
            </Button>
          )}
          {chain && chain.id !== BSC_CHAIN_ID ? (
            <Button
              width={'100%'}
              onClick={async () => {
                switchNetwork?.(BSC_CHAIN_ID);
              }}
            >
              Switch to BSC to Start
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

const InfoCon = styled(Flex)``;

const BaseInfo = styled(Flex)``;

const ImgCon = styled.div`
  width: 80px;
  height: 80px;

  img {
    background: #d9d9d9;
    border-radius: 8px;
  }
`;
const ResourceNameCon = styled(Flex)`
  font-style: normal;
  font-weight: 700;
  font-size: 20px;
  line-height: 28px;

  color: #5f6368;
`;

const CreateTime = styled.div`
  font-style: normal;
  font-weight: 400;
  font-size: 10px;
  line-height: 28px;
`;
const Tag = styled(Flex)`
  margin-left: 16px;

  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 28px;

  width: 100px;
  height: 20px;

  background: #d9d9d9;

  border-radius: 16px;
`;
const ResourceNum = styled(Flex)`
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 28px;

  color: #000000;
`;

const FileInfo = styled(Flex)`
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 28px;

  color: #979797;
  div {
    display: flex;
    gap: 2px;
  }
  span {
    color: #181a1e;
  }
`;

const InputCon = styled.div`
  position: relative;
  .ui-input,
  .ui-textarea {
    background: #ffffff;
    /* readable/border */

    border: 1px solid #e6e8ea;
    border-radius: 8px;
    color: #aeb4bc;
  }
`;

const BNBCon = styled(Flex)`
  position: absolute;
  top: 8px;
  right: 10px;

  font-size: 14px;
  font-weight: 700;
  color: #5f6368;
`;

const FeeCon = styled(Flex)`
  padding: 16px;

  width: 100%;
  height: 115px;

  border: 1px solid #e6e8ea;
  border-radius: 8px;
`;

const Tips = styled(Flex)`
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 18px;

  color: #76808f;

  width: 100%;
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

const LineBox = styled(Box)`
  background: #fff;
`;

const FooterCon = styled(Flex)`
  width: 100%;
`;
