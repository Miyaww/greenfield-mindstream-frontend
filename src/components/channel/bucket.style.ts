import styled from '@emotion/styled';
import { Button } from '@totejs/uikit';

export const BucketContainer = styled.div`
  margin: 24px;
`;

export const PanelContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  height: 40px;
`;

export const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
`;

export const CreateBucketButton = styled(Button)`
  width: 161px;
  height: 40px;
  padding: 8px 24px;
  font-size: 14px;
  white-space: nowrap;
`;
