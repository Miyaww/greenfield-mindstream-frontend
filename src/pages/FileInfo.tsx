import { client, selectSp } from '../utils/gfSDK';

import { Button, Box, Flex, Text } from '@totejs/uikit';
import styled from '@emotion/styled';
import { getUtcZeroTimestamp } from '@bnb-chain/greenfield-js-sdk';
import { EditObject } from '../components/object/Edit';
import { FileInfo } from '../components/object/Info';

export const FileDetail = () => {
  return (
    <Container>
      <FileInfo />
    </Container>
  );
};
const Container = styled.div`
  margin-top: 10px;
  width: 100%;
  max-width: 1123px;
`;
