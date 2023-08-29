import styled from '@emotion/styled';
import { Copy } from '../components/Copy';
import { useAccount } from 'wagmi';
import { Flex, Button } from '@totejs/uikit';
import ChannelList from '../components/channel/ChannelList';
import { trimLongStr } from '../utils';
import { useSearchParams } from 'react-router-dom';
import Web3 from 'web3';
import { useMemo, useState } from 'react';
import { CreateChannelModal } from '../components/modal/CreateChannelModal';
import ProfileList from '../components/profile/Index';

const Profile = () => {
  const { address } = useAccount();
  // const [showButton, setShowButton] = useState(false);
  const [open, setOpen] = useState(false);

  const [p] = useSearchParams();
  const otherAddress = p.getAll('address')[0];

  const realAddress = useMemo(() => {
    return otherAddress && Web3.utils.isAddress(otherAddress)
      ? otherAddress
      : address;
  }, [address, otherAddress]);

  return (
    <Container>
      <PersonInfo gap={32} alignItems={'flex-start'}>
        <Info gap={16} alignItems={'center'} justifyContent={'center'}>
          {/* todo */}
          {/* <Icon src={Logo} alt="" /> */}
          <Address>{trimLongStr(realAddress as string)}</Address>
          <Copy value={realAddress} />
        </Info>
        <Button onClick={() => setOpen(true)}>Create Channel</Button>
      </PersonInfo>
      {realAddress && (
        <ChannelList></ChannelList>
        // <ProfileList
        //   self={realAddress === address}
        //   realAddress={realAddress}
        // ></ProfileList>
      )}
      <CreateChannelModal
        isOpen={open}
        handleOpen={() => {
          setOpen(false);
        }}
      />
    </Container>
  );
};

export default Profile;

const Container = styled.div`
  margin-top: 60px;
`;
const PersonInfo = styled(Flex)`
  width: 100%;
  justify-content: space-between;
  align-items: center;
`;

const ImgCon = styled.div`
  width: 120px;
  height: 120px;

  img {
    background: #d9d9d9;
    border-radius: 24px;
  }
`;

const Info = styled(Flex)``;

const Address = styled.span`
  font-style: normal;
  font-weight: 700;
  font-size: 24px;
  line-height: 24px;

  color: #ffffff;
`;
const Icon = styled.img`
  width: 36px;
  height: 36px;
`;
