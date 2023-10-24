import styled from '@emotion/styled';
import { Flex, Table } from '@totejs/uikit';
import { usePagination } from '../../hooks/usePagination';
import { Link, useNavigate } from 'react-router-dom';
import {
  formatDateUTC,
  trimLongStr,
  divide10Exp,
  defaultImg,
  contentTypeToExtension,
} from '../../utils';
import { useGetListed } from '../../hooks/useGetListed';
import BN from 'bn.js';
import { useAccount } from 'wagmi';
import { useSalesVolume } from '../../hooks/useSalesVolume';
import { useGlobal } from '../../hooks/useGlobal';
import { CollectionLogo } from '../svgIcon/CollectionLogo';
import { ActionCom } from '../ActionCom';

interface ITotalVol {
  id: string;
}
const AllList = () => {
  const { handlePageChange, page } = usePagination();
  const { address: realAddress } = useAccount();
  const { list, loading, total } = useGetListed(realAddress, page, 10);
  console.log(list);
  const handleFollow = (owner: string) => {
    const followList = localStorage.getItem('followList') || '';
    localStorage.setItem('followList', followList + ',' + owner);
  };

  const columns = [
    {
      header: 'Creator',
      width: 200,
      cell: (data: any) => {
        const { name, avatar, address } = data;
        return (
          <ImgContainer
            alignItems={'center'}
            justifyContent={'flex-start'}
            gap={6}
          >
            <ImgCon src={avatar || defaultImg(name, 40)}></ImgCon>
            {trimLongStr(address, 15)}
          </ImgContainer>
        );
      },
    },
    {
      header: 'Name',
      cell: (data: any) => {
        const { name } = data;
        return <div>{name}</div>;
      },
    },
    {
      header: 'Bio',
      width: 160,
      cell: (data: any) => {
        const { bio } = data;
        return <div>{bio}</div>;
      },
    },
    // {
    //   header: 'Address',
    //   width: 120,
    //   cell: (data: any) => {
    //     const { address } = data;
    //     return <div>{trimLongStr(address)}</div>;
    //   },
    // },
  ];
  return (
    <Container>
      <Table
        headerContent={`Latest ${Math.min(
          20,
          list.length,
        )}  users (Total of ${total})`}
        containerStyle={{ padding: '0' }}
        pagination={{
          current: page,
          pageSize: 10,
          total: total,
          onChange: handlePageChange,
        }}
        columns={columns}
        data={list}
        loading={loading}
        hoverBg={'#14151A'}
      />
    </Container>
  );
};

export default AllList;

const Container = styled.div`
  width: 1123px;
`;

const ImgContainer = styled(Flex)`
  cursor: pointer;
  color: ${(props: any) => props.theme.colors.scene.primary.normal};
`;

const ImgCon = styled.img`
  width: 40px;
  height: 40px;

  background: #d9d9d9;
  border-radius: 8px;
`;

const MyLink = styled(Link)`
  color: ${(props: any) => props.theme.colors.scene.primary.normal};
`;
