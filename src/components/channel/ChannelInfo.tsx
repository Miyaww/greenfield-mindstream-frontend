import { useChannelInfo } from '../../hooks/useChannelInfo';
import { useState, useEffect } from 'react';
import { Table, Box, Flex, Button } from '@totejs/uikit';
import styled from '@emotion/styled';
import { useAccount } from 'wagmi';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { contentTypeToExtension } from '../../utils';
import { NoData } from '../../components/NoData';
import { FileActionCom } from '../../components/FileActionCom';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useStatus } from '../../hooks/useStatus';
import { useModal } from '../../hooks/useModal';
import { Loader } from '../../components/Loader';
import { trimLongStr } from '../../utils';
import { Copy } from '../../components/Copy';

dayjs.extend(utc);
enum Type {
  Public = 'public',
  Private = 'private',
}
export const ChannelInfo = () => {
  const { address } = useAccount();

  const [tableData, setTableData] = useState<any>();
  const [p] = useSearchParams();
  const navigate = useNavigate();
  const tab = p.getAll('tab')[0];
  const type = tab ? tab : Type.Private;
  const modalData = useModal();
  const activeGroup = modalData.modalState.activeGroup;
  console.log(activeGroup, 'channelInfo');
  const [objectList, setObjList] = useState<any>([]);
  const { groupName, groupId, ownerAddress } = activeGroup;
  const { publicObjList, privateObjList, fetchChannelInfo, loading } =
    useChannelInfo();

  const { status } = useStatus(groupName, ownerAddress, address as string);
  useEffect(() => {
    if (ownerAddress === address) {
      navigate(
        `/channelList?tab=${type}&address=${ownerAddress}&groupName=${groupName}&groupId=${groupId}`,
      );
    }
  }, [groupName, groupId, address, ownerAddress]);

  useEffect(() => {
    fetchChannelInfo();
  }, [type, address, ownerAddress]);
  useEffect(() => {
    if (loading) return;
    if (type && type === 'public') {
      setObjList(publicObjList);
    } else {
      setObjList(privateObjList);
    }
  }, [loading, type]);

  useEffect(() => {
    if (loading || !address) return;
    console.log('settabledata');
    const data = objectList.filter((item: any) => {
      return !item.Removed && item.ObjectInfo?.ObjectStatus;
    });
    const objInfoList = data.map((item: any) => {
      return item.ObjectInfo;
    });
    setTableData(objInfoList);
  }, [address, objectList, loading, ownerAddress]);

  const columns = [
    {
      header: 'Blog Title',
      cell: (data: any) => {
        return <Box>{data.ObjectName}</Box>;
      },
    },
    // {
    //   header: 'File Type',
    //   cell: (data: any) => {
    //     return (
    //       <Box>
    //         {data.ContentType ? contentTypeToExtension(data.ContentType) : '--'}
    //       </Box>
    //     );
    //   },
    // },
    {
      header: 'Create Time',
      cell: (data: any) => {
        return (
          <Box>
            {data.CreateAt
              ? dayjs.unix(data.CreateAt).utc().format('YYYY-MM-DD hh:mm')
              : '--'}
          </Box>
        );
      },
    },
    {
      header: 'Action',
      cell: (data: any) => {
        if (!data.ObjectName) return <Box></Box>;
        return <FileActionCom data={data} address={address as string} />;
      },
    },
  ];
  //subscribe
  // if (!loading && status === 1 && tab === 'private') {
  //   return (
  //     <NoDataCon
  //       alignItems={'center'}
  //       justifyContent={'center'}
  //       flexDirection={'column'}
  //     >
  //       <Box h={32}></Box>
  //       <NoDataTitle>Private Channel</NoDataTitle>
  //       <Box h={24}></Box>
  //       <NoDataSub>Subscribe to view the content</NoDataSub>
  //     </NoDataCon>
  //   );
  // }
  //no data
  // if (!loading && !tableData?.length)
  //   return (
  //     <NoDataCon
  //       alignItems={'center'}
  //       justifyContent={'center'}
  //       flexDirection={'column'}
  //     >
  //       <NoData size={280}></NoData>
  //       <NoDataTitle>No Data</NoDataTitle>
  //       {address === ownerAddress && (
  //         <Button
  //           mt={20}
  //           fontSize={20}
  //           onClick={() => {
  //             navigate(
  //               `/edit?address=${address}&groupName=${groupName}&groupId=${groupId}`,
  //             );
  //           }}
  //         >
  //           Write Blog
  //         </Button>
  //       )}
  //     </NoDataCon>
  //   );

  return (
    <>
      <Container>
        <Info gap={16} alignItems={'center'}>
          <Address>{trimLongStr(ownerAddress as string)}</Address>
          {ownerAddress === address && <Copy value={address} />}
        </Info>
        {loading ? (
          <Loader />
        ) : tableData && tableData?.length ? (
          <Table data={tableData} columns={columns} loading={loading}></Table>
        ) : tab === 'private' && ownerAddress !== address ? (
          <NoDataCon
            alignItems={'center'}
            justifyContent={'center'}
            flexDirection={'column'}
          >
            <Box h={32}></Box>
            <NoDataTitle>Private Channel</NoDataTitle>
            <Box h={24}></Box>
            <NoDataSub>Subscribe to view the content</NoDataSub>
          </NoDataCon>
        ) : (
          <NoDataCon
            alignItems={'center'}
            justifyContent={'center'}
            flexDirection={'column'}
          >
            <NoData size={280}></NoData>
            <NoDataTitle>No Data</NoDataTitle>
          </NoDataCon>
        )}

        <Flex w="100%" justifyContent={'center'} alignItems={'center'} mt={40}>
          {address === ownerAddress && (
            <Button
              size="lg"
              onClick={() => {
                navigate(
                  `/edit?address=${address}&groupName=${groupName}&groupId=${groupId}`,
                );
              }}
            >
              Write Blog
            </Button>
          )}
        </Flex>
      </Container>
    </>
  );
};
const Container = styled.div`
  width: 1200px;
`;
const NoDataCon = styled(Flex)``;

const NoDataTitle = styled.div`
  font-size: 32px;
  font-weight: 600;
`;

const NoDataSub = styled.div`
  font-size: 20px;
`;
const PersonInfo = styled(Flex)`
  width: 100%;
  justify-content: space-between;
  align-items: center;
`;

const Info = styled(Flex)`
  width: '100%';
  margin-bottom: 16px;
`;

const Address = styled.span`
  font-style: normal;
  font-weight: 700;
  font-size: 24px;
  line-height: 24px;
`;
