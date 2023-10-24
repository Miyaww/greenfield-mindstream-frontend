import { Box, Flex } from '@totejs/uikit';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { useChannelList, BucketProps } from '../../hooks/useChannelList';
import { useModal } from '../../hooks/useModal';
import { useCallback, useState, useEffect } from 'react';
import { NavBar } from '../NavBar';
import { ChannelInfo } from './ChannelInfo';
import CollNoData from '../../components/profile/CollNoData';
import { isEmpty } from 'lodash-es';
import { ChannelActionCom } from '../../components/ChannelActionCom';

enum Type {
  Public = 'public',
  Private = 'private',
}
const navItems = [
  {
    name: 'Public',
    key: Type.Public,
  },
  {
    name: 'Private',
    key: Type.Private,
  },
];
export const Channel = () => {
  const { address: realAddress } = useAccount();
  const modalData = useModal();
  const { activeGroup } = modalData.modalState;
  const { groupName, groupId } = activeGroup;

  const [p] = useSearchParams();
  const navigator = useNavigate();
  const tab = p.getAll('tab')[0];
  const currentTab = tab ? tab : Type.Public;
  const ownerAddress = p.getAll('address')[0] || realAddress;
  // const groupName = p.getAll('groupName')[0];
  // const groupId = p.getAll('groupId')[0];
  const [filterdNavItems, setFilterdNavItems] = useState(navItems);

  const { list, loading: listLoading } = useChannelList(ownerAddress as string);
  useEffect(() => {
    if (list?.length && list?.length < 2 && !listLoading) {
      const type = list[0].BucketInfo.BucketName.includes('public')
        ? 'public'
        : 'private';
      setFilterdNavItems(navItems.filter((item) => item.key === type));
    }
  }, [list, listLoading]);
  useEffect(() => {
    if (!listLoading && !list) return;
    if (groupId === 'undefined' || !groupId) {
      const currentChannel = list?.filter((item) => {
        return item.BucketInfo.BucketName.includes(tab);
      });

      if (!currentChannel || !currentChannel.length) return;
      const { groupName, groupId } = currentChannel[0];
      modalData.modalDispatch({
        type: 'SET_ACTIVE_GROUP',
        activeGroup: { groupName, groupId, ownerAddress },
      });
    }
  }, [list, listLoading, tab, groupId, ownerAddress]);
  const handleTabChange = useCallback(
    (tab: any) => {
      navigator(
        `/channelList?tab=${tab}&address=${ownerAddress}&groupName=${groupName}&groupId=${groupId}`,
      );
    },
    [groupName, groupId, ownerAddress],
  );

  return (
    <Box w="100%" maxW="1200px">
      {isEmpty(list) && !listLoading && <CollNoData />}
      {!isEmpty(list) && (
        <>
          <Flex justify={'space-between'}>
            <NavBar
              active={currentTab}
              onChange={handleTabChange}
              items={filterdNavItems}
            />
            <ChannelActionCom />
          </Flex>

          <Box h={20} />
          <ChannelInfo />
        </>
      )}
    </Box>
  );
};
