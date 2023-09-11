import styled from '@emotion/styled';
import { ChannelInfo } from '../components/channel/ChannelInfo';
import { useLocation } from 'react-router-dom';

export const ChannelDetail = () => {
  const location = useLocation();

  const { bucketName, bucketId } = location.state;

  return (
    <Container>
      <ChannelInfo bucketId={bucketId} bucketName={bucketName} />
      {/* <EditObject /> */}
    </Container>
  );
};
const Container = styled.div`
  margin-top: 10px;
  width: 100%;
  max-width: 1200px;
`;
