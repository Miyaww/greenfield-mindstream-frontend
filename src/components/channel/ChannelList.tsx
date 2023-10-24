import styled from '@emotion/styled';
import {
  Link as UILink,
  Flex,
  Table,
  Box,
  Button,
  Breadcrumb,
  BreadcrumbItem,
  toast,
  Badge,
} from '@totejs/uikit';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useChannelList, BucketProps } from '../../hooks/useChannelList';
import { useState, useEffect, useCallback } from 'react';
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
import { useAsyncEffect } from 'ahooks';
import { OwnBuyContract } from '../../base/contract/ownBuyContract';
import { client } from '../../utils/gfSDK';
import { useApprove } from '../../hooks/useApprove';
import { useHasRole } from '../../hooks/useHasRole';
import { useUserSetting } from '../../hooks/useUserSetting';
import { checkAddressInGroup } from '../../utils/gfSDK';
import dayjs from 'dayjs';

const ChannelList = () => {
  const [p] = useSearchParams();
  const navigate = useNavigate();
  const state = useGlobal();
  const [breadItems, setBreadItems] = useState<any>([]);
  const { address: realAddress, connector } = useAccount();
  const [open, setOpen] = useState(false);
  const [openUpSub, setOpenCharge] = useState(false);
  const [openSub, setOpenSub] = useState(false);
  const { hasOpenUpSub } = useUserSetting();
  const [tableData, setTableData] = useState<BucketProps[]>();
  const [expiration, setExpiration] = useState<string>('');

  const { Approve } = useApprove();
  const { hasRole, setHasRole, loading: roleLoading } = useHasRole();
  // -1 do not login
  // 0 owner
  // 1 Waiting for purchase
  // 2 purchase

  const address = p.get('address') || realAddress;
  const { list, loading: listLoading } = useChannelList(address as string);
  const getUserStatus = useCallback(
    async (groupName: string, groupOwner: string, realAddress: string) => {
      if (!realAddress) return -1;
      console.log(realAddress, groupOwner);
      if (realAddress === groupOwner) {
        return 0;
      }
      try {
        const result = await checkAddressInGroup(
          groupName,
          groupOwner,
          realAddress,
        );
        if (result) {
          const { groupMember } = result;
          const { expirationTime } = groupMember;
          if (expirationTime) {
            const seconds = expirationTime.seconds.low;
            const nanos = expirationTime.nanos;

            const milliseconds = seconds * 1000 + nanos / 1e6;
            const date = dayjs(milliseconds).format('YYYY-MM-DD HH:mm');
            console.log(JSON.stringify(date), 'expirationTime');
            setExpiration(date);
          }
          return 2;
        } else {
          return 1;
        }
      } catch (error) {
        return -1;
      }
    },
    [],
  );

  const handleCheckRole = useCallback(
    async (data: any) => {
      if (roleLoading) return;
      console.log(hasRole, 'hasRole');
      if (hasRole) {
        handleOpenChargeModal(data);
      } else {
        const res = await Approve(data.groupId);
      }
    },
    [roleLoading, hasRole],
  );

  useAsyncEffect(async () => {
    if (list) {
      console.log(list);
      const updatedList = await Promise.all(
        list.map(async (item) => {
          const { groupId, groupName } = item;

          const hasMirror = await OwnBuyContract(false)
            .methods.exists(Number(groupId))
            .call({ from: realAddress });

          console.log(hasMirror, 'hasMirror');

          if (!address || !groupId) return item;

          if (!hasMirror) {
            const mirrorGroupTx = await client.crosschain.mirrorGroup({
              groupName: '',
              id: groupId.toString(),
              operator: address,
              destChainId: 97,
            });

            const simulateInfo = await mirrorGroupTx.simulate({
              denom: 'BNB',
            });

            console.log(simulateInfo);

            const res = await mirrorGroupTx.broadcast({
              denom: 'BNB',
              gasLimit: Number(simulateInfo.gasLimit),
              gasPrice: simulateInfo.gasPrice,
              payer: address,
              granter: '',
              signTypedDataCallback: async (addr: string, message: string) => {
                const provider = await connector?.getProvider();
                return await provider?.request({
                  method: 'eth_signTypedData_v4',
                  params: [addr, message],
                });
              },
            });

            if (res) {
              toast.info({ description: 'mirror group' });
            }
          }
          const status = await getUserStatus(
            groupName,
            address,
            realAddress as string,
          );
          console.log(status, 'status');

          return { ...item, status };
        }),
      );

      setTableData(updatedList);
    }
  }, [list, address, realAddress]);

  const modalData = useModal();

  const showNoData = useMemo(() => {
    const show = !listLoading && !tableData?.length && address;
    return show;
  }, [listLoading, list, tableData, address]);

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
        const { BucketInfo, status } = data;
        const { BucketName, Id, Owner } = BucketInfo;
        return (
          <Flex>
            <UILink
              _hover={{ cursor: 'pointer' }}
              onClick={() => {
                const item = {
                  path: '/channelInfo',
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
                    groupId: data.groupId,
                  },
                });
              }}
            >
              View
            </UILink>
            {BucketName.includes('private') && Owner === realAddress && (
              <UILink
                _hover={{ cursor: 'pointer' }}
                ml={12}
                onClick={() => handleCheckRole(data)}
              >
                {hasOpenUpSub ? 'Set Price' : 'Open Up Subscribe'}
              </UILink>
            )}
            {BucketName.includes('private') && status === 1 && (
              <UILink
                _hover={{ cursor: 'pointer' }}
                ml={12}
                onClick={() => handleOpenSubModal(data)}
              >
                Subscribe
              </UILink>
            )}
            {BucketName.includes('private') && status === 2 && (
              <Flex>
                <Badge ml={12} colorScheme="success">
                  Subscribe
                </Badge>
                <Box fontSize={12}>expire at {expiration}</Box>
              </Flex>
            )}
          </Flex>
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
          {openUpSub && (
            <OpenSubModal
              isOpen={openUpSub}
              type={hasOpenUpSub ? 'SET_PRICE' : 'OPEN_UP'}
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
            <Table columns={columns} data={tableData}></Table>
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
