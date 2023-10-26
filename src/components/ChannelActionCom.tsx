import { useAccount } from 'wagmi';
import { useState, useEffect, useCallback } from 'react';
import { useStatus } from '../hooks/useStatus';
import { useModal } from '../hooks/useModal';
import styled from '@emotion/styled';
import { Button, Flex, Badge } from '@totejs/uikit';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { isEmpty } from 'lodash-es';
import { Loader } from '../components/Loader';

import { useGetApproved } from '../hooks/useGetApproved';
import { useChannelList, BucketProps } from '../hooks/useChannelList';
import { useUserSetting } from '../hooks/useUserSetting';
import { useApprove } from '../hooks/useApprove';
import { useProfile } from '../hooks/useProfile';

import { CreateChannelModal } from '../components/modal/CreateChannelModal';
import { OpenSubModal } from './modal/OpenUpSubModal';
import { SubscribeModal } from './modal/SubscribeModal';

export const ChannelActionCom = () => {
  const { address } = useAccount();
  const { hasOpenUpSub } = useUserSetting();
  const [p] = useSearchParams();
  const tab = p.getAll('tab')[0];
  const { profile } = useProfile();

  const modalData = useModal();
  const { activeGroup } = modalData.modalState;
  const { groupId, groupName, ownerAddress } = activeGroup;

  const { status } = useStatus(groupName, ownerAddress, address as string);
  const { list, loading: listLoading } = useChannelList(address as string);

  const { Approve } = useApprove();
  const [approveLoading, setApproveLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [openUpSub, setOpenCharge] = useState(false);
  const [openSub, setOpenSub] = useState(false);

  const { hasRole, loading: roleLoading } = useGetApproved();

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
  }, [list, listLoading, tab]);

  const handleOpenChargeModal = () => {
    setOpenCharge(true);
  };
  const handleOpenSubModal = (data: any) => {
    if (!data) return;
    modalData.modalDispatch({
      type: 'OPEN_SUB_MODAL',
      subItem: data,
    });
  };

  const handleCheckRole = useCallback(async () => {
    if (roleLoading) return;
    if (hasRole) {
      handleOpenChargeModal();
    } else {
      const groupId = activeGroup.groupId;
      setApproveLoading(true);
      const res = await Approve(groupId);
      if (res && typeof res === 'object' && 'status' in res && res.status) {
        handleOpenChargeModal();
      }
      setApproveLoading(false);
    }
  }, [roleLoading, hasRole, activeGroup]);

  return (
    <>
      <ButtonCon gap={6}>
        {ownerAddress === address &&
          (isEmpty(list) || !list || list?.length < 2) && (
            <Button
              size={'md'}
              onClick={() => {
                if (!profile?.name) {
                  modalData.modalDispatch({ type: 'OPEN_PROFILE' });
                  return;
                }
                setOpen(true);
              }}
            >
              Create Channel
            </Button>
          )}

        {ownerAddress === address && tab === 'private' && (
          <Button
            size={'md'}
            onClick={() => handleCheckRole()}
            disabled={roleLoading}
          >
            {hasOpenUpSub ? 'Set Price' : 'Open Up Subscribe'}
            {approveLoading && (
              <Loader
                style={{ width: '24px', marginLeft: '8px' }}
                size={24}
                minHeight={24}
              ></Loader>
            )}
          </Button>
        )}
        {ownerAddress !== address &&
          status === 1 &&
          tab === 'private' && ( // 1 login not sub
            <Button size={'md'} onClick={() => handleOpenSubModal(activeGroup)}>
              Subscribe
            </Button>
          )}
      </ButtonCon>
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
    </>
  );
};
const ButtonCon = styled(Flex)`
  padding: 20px 0;
`;
