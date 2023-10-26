import { useAccount } from 'wagmi';
import { useStatus } from '../hooks/useStatus';
import { useModal } from '../hooks/useModal';
import styled from '@emotion/styled';
import { Button, Flex, Badge } from '@totejs/uikit';
import { useWalletModal } from '../hooks/useWalletModal';
import { useNavigate } from 'react-router-dom';
import { ObjectInfo } from '../base/type';

interface IActionCom {
  data: ObjectInfo;
  address: string;
}
export const FileActionCom = (obj: IActionCom) => {
  const { data, address } = obj;
  const { isConnected, isConnecting } = useAccount();

  const modalData = useModal();
  const { activeGroup } = modalData.modalState;
  const { groupId, groupName, ownerAddress } = activeGroup;

  const { status } = useStatus(groupName, ownerAddress, address);
  const { handleModalOpen } = useWalletModal();
  const navigate = useNavigate();

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
            // handleSetActive(data);
            const type = groupName.includes('public') ? 'public' : 'private';
            navigate(
              `/file?tab=${type}&address=${ownerAddress}&groupId=${groupId}&groupName=${groupName}`,
              {
                state: {
                  fileTitle: data.ObjectName,
                  createAt: data.CreateAt,
                  owner: data.Owner,
                  channel: data.BucketName,
                  isPrivate: type === 'private',
                },
              },
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
          Subscribe
        </Badge>
      )}
    </ButtonCon>
  );
};
const ButtonCon = styled(Flex)``;
