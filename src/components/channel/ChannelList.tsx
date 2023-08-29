import styled from '@emotion/styled';
import { Link, Flex, Table, Box } from '@totejs/uikit';
import { useAccount, useSwitchNetwork } from 'wagmi';
import { GF_CHAIN_ID } from '../../env';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useChannelList, BucketProps } from '../../hooks/useChannelList';
import { useSP } from '../../hooks/useSP';

import { useModal } from '../../hooks/useModal';
import { useSalesVolume } from '../../hooks/useSalesVolume';
import { useListedStatus } from '../../hooks/useListedStatus';
import { BN } from 'bn.js';
import { useGlobal } from '../../hooks/useGlobal';
import CollNoData from '../../components/profile/CollNoData';
import { Dispatch, useMemo } from 'react';
//"/Users/user/greenfield-data-marketplace-frontend/src/hooks/useListedStatus"
//"/Users/user/greenfield-data-marketplace-frontend/src/hooks/useChannelList"
// const PriceCon = (props: { groupId: string }) => {
//   const { groupId } = props;
//   const { price } = useListedStatus(groupId);

//   let balance = '-';
//   if (price) {
//     balance = divide10Exp(new BN(price, 10), 18) + ' BNB';
//   }
//   return <div>{balance}</div>;
// };

const TotalVol = (props: { groupId: string }) => {
  const { groupId } = props;
  const { salesVolume } = useSalesVolume(groupId);
  return <div>{Number(salesVolume) || '-'}</div>;
};

interface ICollectionList {
  setShowButton?: Dispatch<boolean>;
}
const ChannelList = (props: ICollectionList) => {
  const { list, loading: listLoading } = useChannelList();
  const [p] = useSearchParams();
  const navigate = useNavigate();

  const showNoData = useMemo(() => {
    const show = !listLoading && !list?.length;
    // setShowButton(!show);
    return show;
  }, [listLoading, list]);

  const columns = [
    {
      header: 'Index',
      cell: () => {
        return <Box>{1}</Box>;
      },
    },
    {
      header: 'Channel',
      cell: (data: BucketProps) => {
        const { BucketInfo } = data;
        const { BucketName } = BucketInfo;
        return <Box>{BucketName}</Box>;
      },
    },
    {
      header: 'Type',
      cell: (data: BucketProps) => {
        const { BucketInfo } = data;
        const { BucketName } = BucketInfo;
        return (
          <Box textTransform={'uppercase'}>
            {BucketName.includes('public') ? 'public' : 'private'}
          </Box>
        );
      },
    },
    {
      header: 'Action',
      cell: (data: BucketProps) => {
        const { BucketInfo } = data;
        const { BucketName, Id } = BucketInfo;
        return (
          <Box>
            <Link
              _hover={{ cursor: 'pointer' }}
              onClick={() =>
                navigate(`/channel?bucketName=${BucketName}&bucketId=${Id}`)
              }
              // href={`channel?${BucketName}:${Id}`}
            >
              view
            </Link>
          </Box>
        );
      },
    },
  ];

  return (
    <Container>
      {/* <CollNoData /> */}
      {showNoData ? (
        <CollNoData />
      ) : (
        <Table columns={columns} data={list}></Table>
      )}
    </Container>
  );
};

export default ChannelList;

const Container = styled.div`
  width: 1200px;
`;
