import styled from '@emotion/styled';
import {
  Link as UILink,
  Flex,
  Table,
  Box,
  Button,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from '@totejs/uikit';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useChannelList, BucketProps } from '../../hooks/useChannelList';
import { useState, useEffect } from 'react';
import { trimLongStr } from '../../utils';
import { useAccount } from 'wagmi';
import { Copy } from '../../components/Copy';
import { CreateChannelModal } from '../../components/modal/CreateChannelModal';
import { OpenSubModal } from '../modal/OpenUpSubModal';
import { SubscribeModal } from '../modal/SubscribeModal';
import { useGlobal } from '../../hooks/useGlobal';
import CollNoData from '../../components/profile/CollNoData';
import { useMemo } from 'react';
import { useModal } from '../../hooks/useModal';

const ChannelList = () => {
  const [p] = useSearchParams();
  const navigate = useNavigate();
  const state = useGlobal();
  const [breadItems, setBreadItems] = useState<any>([]);
  const { address: realAddress } = useAccount();
  const [open, setOpen] = useState(false);
  const [openCharge, setOpenCharge] = useState(false);
  const [openSub, setOpenSub] = useState(false);
  const [price, setPrice] = useState();

  const address = p.get('address') || realAddress;
  const { list, loading: listLoading } = useChannelList(address as string);

  const modalData = useModal();

  const showNoData = useMemo(() => {
    const show = !listLoading && !list?.length;
    return show;
  }, [listLoading, list]);

  const handleOpenChargeModal = (data: BucketProps) => {
    if (!data) return;
    modalData.modalDispatch({
      type: 'OPEN_SUB_MODAL',
      subItem: data,
    });
    setOpenCharge(true);
  };
  const handleOpenSubModal = (data: BucketProps) => {
    if (!data) return;
    modalData.modalDispatch({
      type: 'OPEN_SUB_MODAL',
      subItem: data,
    });
    setOpenSub(true);
  };

  useEffect(() => {
    const list = state.globalState.breadList;
    setBreadItems(
      list.concat([
        {
          name: 'channel',
          query: '',
          path: '',
        },
      ]),
    );
  }, [state.globalState.breadList]);
  const columns = [
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
        const { BucketName, Id, Owner } = BucketInfo;
        return (
          <Box>
            <UILink
              _hover={{ cursor: 'pointer' }}
              onClick={() => {
                const list = state.globalState.breadList;
                const item = {
                  path: '/channel',
                  name: BucketName,
                  query: p.toString(),
                };
                state.globalDispatch({
                  type: 'ADD_BREAD',
                  item,
                });
                navigate(`/channel`, {
                  state: {
                    bucketName: BucketName,
                    bucketId: Id,
                    address,
                    groupName: data.groupName,
                  },
                });
              }}
            >
              view
            </UILink>
            {BucketName.includes('private') && Owner === address && (
              <UILink
                _hover={{ cursor: 'pointer' }}
                ml={12}
                onClick={() => handleOpenChargeModal(data)}
              >
                charge
              </UILink>
            )}
            {BucketName.includes('private') && Owner !== address && (
              <UILink
                _hover={{ cursor: 'pointer' }}
                ml={12}
                onClick={() => handleOpenSubModal(data)}
              >
                subscribe
              </UILink>
            )}
          </Box>
        );
      },
    },
  ];

  return (
    <>
      <MyBreadcrumb>
        {breadItems.map((item: any, index: number) => {
          return (
            <MyBreadcrumbItem
              isCurrentPage={index === breadItems.length - 1}
              onClick={() => {
                state.globalDispatch({
                  type: 'DEL_BREAD',
                  name: item.name,
                });
              }}
              key={item.name}
            >
              <Box fontSize="16px">
                <Link
                  to={`${item.path}` + (item.query ? '?' + item.query : '')}
                >
                  {item?.name?.replace('+', ' ')}
                </Link>
              </Box>
            </MyBreadcrumbItem>
          );
        })}
      </MyBreadcrumb>
      {address && (
        <Container>
          <PersonInfo gap={32} alignItems={'flex-start'}>
            <Info gap={16} alignItems={'center'} justifyContent={'center'}>
              <Address>{trimLongStr(address as string)}</Address>
              {realAddress === address && <Copy value={address} />}
            </Info>
            {realAddress === address && (
              <Button
                onClick={() => {
                  setOpen(true);
                }}
              >
                Create Channel
              </Button>
            )}
          </PersonInfo>
          <CreateChannelModal
            isOpen={open}
            handleOpen={() => {
              setOpen(false);
            }}
          />
          {openCharge && (
            <OpenSubModal
              isOpen={openCharge}
              handleOpen={() => {
                setOpenCharge(false);
              }}
            />
          )}
          {openSub && (
            <SubscribeModal
              isOpen={openSub}
              handleOpen={() => {
                setOpenSub(false);
              }}
            />
          )}
          {/* <CollNoData /> */}
          {showNoData ? (
            <CollNoData />
          ) : (
            <Table columns={columns} data={list}></Table>
          )}
        </Container>
      )}
    </>
  );
};

export default ChannelList;

const Container = styled.div`
  width: 1200px;
  margin-top: 24px;
`;

const MyBreadcrumb = styled(Breadcrumb)`
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 18px;

  color: #ffffff;
`;

const MyBreadcrumbItem = styled(BreadcrumbItem)``;
const PersonInfo = styled(Flex)`
  width: 100%;
  justify-content: space-between;
  align-items: center;
`;

const Info = styled(Flex)``;

const Address = styled.span`
  font-style: normal;
  font-weight: 700;
  font-size: 24px;
  line-height: 24px;

  color: #ffffff;
`;
const Icon = styled.img`
  width: 36px;
  height: 36px;
`;
