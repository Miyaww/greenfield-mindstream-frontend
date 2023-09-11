import { useChannelInfo } from '../../hooks/useChannelInfo';
import { useState, useEffect } from 'react';
import {
  Table,
  Box,
  Link,
  Flex,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
} from '@totejs/uikit';
import styled from '@emotion/styled';
import { useAccount } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { contentTypeToExtension, encodeObjectName } from '../../utils';
import { useGlobal } from '../../hooks/useGlobal';
import { NoData } from '../../components/NoData';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { VisibilityType } from '@bnb-chain/greenfield-cosmos-types/greenfield/storage/common';

dayjs.extend(utc);

interface ChannelInfoProps {
  bucketId: string;
  bucketName: string;
}
export const ChannelInfo = (props: ChannelInfoProps) => {
  const [tableData, setTableData] = useState<any>();
  const navigate = useNavigate();
  const [breadItems, setBreadItems] = useState<any>([]);
  const { bucketId, bucketName } = props;
  const [owner, setOwner] = useState('');
  const { address } = useAccount();
  const { bucketInfo, objectList, loading, primarySp, fetchChannelInfo } =
    useChannelInfo(bucketId, bucketName);

  useEffect(() => {
    fetchChannelInfo();
  }, [fetchChannelInfo]);
  useEffect(() => {
    if (loading) return;
    if (bucketInfo?.owner) {
      setOwner(bucketInfo?.owner);
    }
  }, [loading, bucketInfo]);

  useEffect(() => {
    if (loading || !objectList?.length) return;
    console.log(address, owner, address === owner);

    if (address === owner) {
      const data = objectList.filter((item: any) => {
        return !item.Removed && item.ObjectInfo?.ObjectStatus;
      });
      const objInfoList = data.map((item: any) => {
        return item.ObjectInfo;
      });
      console.log(objInfoList, 'objInfoList');
      setTableData(objInfoList);
    }
  }, [address, objectList, owner, loading]);
  const isPrivate = (visibility: number) => {
    return visibility === VisibilityType.VISIBILITY_TYPE_PRIVATE;
  };

  const columns = [
    {
      header: 'File',
      cell: (data: any) => {
        return <Box>{data.ObjectName}</Box>;
      },
    },
    {
      header: 'File Type',
      cell: (data: any) => {
        return (
          <Box>
            {data.ContentType ? contentTypeToExtension(data.ContentType) : '--'}
          </Box>
        );
      },
    },
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
        const encodedObjectName = encodeObjectName(data.ObjectName);
        const privateFile = isPrivate(data.Visibility);
        const previewLink = privateFile
          ? encodeURI(`${primarySp}/view/${bucketName}/${encodedObjectName}`)
          : '';
        return (
          <Box>
            <Link
              _hover={{ cursor: 'pointer' }}
              onClick={() => {
                navigate(`/file`, {
                  state: {
                    previewLink,
                    fileTitle: data.ObjectName,
                    createAt: data.CreateAt,
                    owner: data.Owner,
                    channel: data.BucketName,
                    isPrivate: privateFile,
                    bucketId,
                  },
                });
              }}
            >
              view
            </Link>
          </Box>
        );
      },
    },
  ];
  if (!loading && !tableData?.length)
    return (
      <NoDataCon
        alignItems={'center'}
        justifyContent={'center'}
        flexDirection={'column'}
      >
        <NoData size={280}></NoData>
        <NoDataTitle>No Data</NoDataTitle>
        <Button
          mt={20}
          fontSize={20}
          onClick={() => {
            navigate(`/edit?bucketName=${bucketName}`);
          }}
        >
          Write Blog
        </Button>
      </NoDataCon>
    );
  return (
    <Container>
      {!loading && tableData && tableData.length && (
        <Table data={tableData} columns={columns}></Table>
      )}
    </Container>
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
const MyBreadcrumb = styled(Breadcrumb)`
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 18px;

  color: #ffffff;
`;

const MyBreadcrumbItem = styled(BreadcrumbItem)``;
