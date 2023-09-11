import styled from '@emotion/styled';
import { Copy } from '../components/Copy';
import { useAccount } from 'wagmi';
import { Flex, Button } from '@totejs/uikit';
import ChannelList from '../components/channel/ChannelList';
import { trimLongStr } from '../utils';
import { useSearchParams } from 'react-router-dom';
import Web3 from 'web3';
import { useMemo, useState } from 'react';
import ProfileList from '../components/profile/Index';
import { useModal } from '../hooks/useModal';

const Profile = () => {
  const { address } = useAccount();
  const [p] = useSearchParams();
  const otherAddress = p.getAll('address')[0];

  const realAddress = useMemo(() => {
    return otherAddress && Web3.utils.isAddress(otherAddress)
      ? otherAddress
      : address;
  }, [address, otherAddress]);

  return <Container>{realAddress && <ChannelList></ChannelList>}</Container>;
};

export default Profile;

const Container = styled.div`
  margin-top: 24px;
`;
