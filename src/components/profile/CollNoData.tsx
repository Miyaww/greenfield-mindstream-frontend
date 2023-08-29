import styled from '@emotion/styled';
import NoDataLogo from '../../images/no_data_logo.png';
import { Button, Flex } from '@totejs/uikit';
import { CreateChannelModal } from '../modal/CreateChannelModal';
import { useState } from 'react';
const CollNoData = () => {
  const [open, setOpen] = useState(false);
  return (
    <Container alignItems={'center'} justifyContent={'center'}>
      <Content gap={20} flexDirection={'column'} alignItems={'center'}>
        <img src={NoDataLogo} alt="" />
        <Title>
          You don’t have any channel on Greenfield Testnet. Create a channel to
          post blogs👏
        </Title>
        <MyButton
          onClick={() => {
            if (open) return;
            setOpen(true);
          }}
          size={'sm'}
          style={{ marginLeft: '6px' }}
        >
          Create Channel
        </MyButton>
      </Content>
      <CreateChannelModal
        isOpen={open}
        handleOpen={() => {
          setOpen(false);
        }}
      />
    </Container>
  );
};

export default CollNoData;

const Container = styled(Flex)`
  width: 1100px;
  height: 596px;

  padding: 4px 20px;
`;

const Content = styled(Flex)`
  img {
    width: 120px;
    height: 120px;
  }
`;

const Title = styled.div`
  width: 320px;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
`;

const MyButton = styled(Button)`
  width: 200px;
  height: 40px;
  border-radius: 8px;
`;
