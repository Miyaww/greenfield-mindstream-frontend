import { useAccount } from 'wagmi';
import { useStatus } from '../hooks/useStatus';
import { useModal } from '../hooks/useModal';
import styled from '@emotion/styled';
import { Button, Flex, Badge } from '@totejs/uikit';
import { useWalletModal } from '../hooks/useWalletModal';
import { ITrendingListItem } from '../hooks/useTrendingList';
import { useNavigate } from 'react-router-dom';
import { IGroupItem } from '@/base/type';

interface IActionCom {
  data: ITrendingListItem;
  address: string;
}
export const ActionCom = (obj: IActionCom) => {
  const { data, address } = obj;
  const { groupId, groupName, ownerAddress } = data;
  const { isConnected, isConnecting } = useAccount();

  const modalData = useModal();

  const { status } = useStatus(groupName, ownerAddress, address);
  const { handleModalOpen } = useWalletModal();
  const navigate = useNavigate();

  const handleSetActive = (data: IGroupItem) => {
    modalData.modalDispatch({
      type: 'SET_ACTIVE_GROUP',
      activeGroup: data,
    });
  };

  return (
    <ButtonCon gap={6}>
      {status === -1 && (
        <Button
          size={'sm'}
          onClick={() => {
            if (!isConnected && !isConnecting) handleModalOpen();
          }}
        >
          connect
        </Button>
      )}
      {status == 0 && (
        <Badge ml={12} colorScheme="primary">
          My Channel
        </Badge>
      )}
      {status !== -1 && (
        <Button
          size={'sm'}
          onClick={() => {
            handleSetActive(data);
            const { groupName } = data;
            const type = groupName === 'public' ? 'public' : 'private';
            navigate(
              `/channelList?tab=${type}&address=${ownerAddress}&groupName=${groupName}&groupId=${groupId}`,
            );
          }}
        >
          View
        </Button>
      )}
      {status == 1 && (
        <Button
          size={'sm'}
          onClick={() => {
            modalData.modalDispatch({
              type: 'OPEN_SUB_MODAL',
              subItem: data,
            });
          }}
        >
          Subscribe
        </Button>
      )}
      {status == 2 && (
        <Badge ml={12} colorScheme="success">
          Subscribed
        </Badge>
      )}
    </ButtonCon>
  );
};
const ButtonCon = styled(Flex)``;
