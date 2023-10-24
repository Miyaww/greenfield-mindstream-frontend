import styled from '@emotion/styled';
import { Flex, Table, Box, Link as UILink } from '@totejs/uikit';
import { useNavigate } from 'react-router-dom';
import BN from 'bn.js';
import { useAccount } from 'wagmi';

import {
  useTrendingList,
  ITrendingListItem,
} from '../../hooks/useTrendingList';

import { ActionCom } from '../ActionCom';
import { divide10Exp } from '../../utils';

const TrendingList = () => {
  const { list, loading } = useTrendingList();
  const { address } = useAccount();

  const columns = [
    {
      header: '#',
      width: 20,
      cell: (data: ITrendingListItem) => {
        const { rank } = data;
        return <Rank className={rank <= 3 ? 'active' : ''}>{rank}</Rank>;
      },
    },
    {
      header: 'Author Name',
      width: 180,
      cell: (data: ITrendingListItem) => {
        const { authorName } = data;
        return (
          <Box wordBreak={'break-all'} whiteSpace={'normal'}>
            {authorName}
          </Box>
        );
      },
    },
    {
      header: 'Total Volume',
      cell: (data: ITrendingListItem) => {
        const { salesVolume } = data;
        return <div>{salesVolume}</div>;
      },
    },
    {
      header: 'Total Revenue',
      cell: (data: ITrendingListItem) => {
        const { salesRevenue } = data;
        const revenue = divide10Exp(new BN(salesRevenue, 10), 18);
        return <div>{revenue} BNB</div>;
      },
    },
    {
      header: 'Action',
      cell: (data: ITrendingListItem) => {
        return <ActionCom data={data} address={address as string}></ActionCom>;
      },
    },
  ];
  return (
    <Container>
      <Table
        containerStyle={{ padding: '0', background: '#333333' }}
        columns={columns}
        data={list}
        loading={loading}
        hoverBg={'bg.middle'}
        withContainer={true}
        w="100%"
      />
    </Container>
  );
};

export default TrendingList;

const Container = styled.div`
  width: 1123px;
`;

const Rank = styled.div`
  &.active {
    font-size: 24px;
    font-weight: 500;
    color: ${(props: any) => props.theme.colors.scene.primary.normal};
  }
`;
