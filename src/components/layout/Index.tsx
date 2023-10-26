import Header from './Header';
import Footer from './Footer';
import { ReactNode, useCallback, useEffect } from 'react';
import styled from '@emotion/styled';
import { Flex } from '@totejs/uikit';
import { ListModal } from '../modal/ListModal';
import { ListProcess } from '../modal/ListProcess';
import { ActionResult } from '../modal/ActionResult';
import { BuyIndex } from '../modal/buy/Index';
import { SubscribeModal } from '../modal/SubscribeModal';

import { useModal } from '../../hooks/useModal';
import { useWalletModal } from '../../hooks/useWalletModal';
import { WalletConnectModal } from '../wallet/WalletConnectModal';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { ProfileModal } from '../modal/ProfileModal';
import { useProfile } from '../../hooks/useProfile';

export default function Layout({ children }: { children: ReactNode }) {
  const modalData = useModal();
  const { modalData: walletModalData, handleModalClose } = useWalletModal();
  const walletModalOpen = walletModalData.modalState?.open;
  const { isConnected, isConnecting, address } = useAccount();
  const navigator = useNavigate();
  const { profile } = useProfile();
  const { openEditProfile } = modalData.modalState;
  const handleEditProfileOpen = useCallback(() => {
    modalData.modalDispatch({ type: 'CLOSE_PROFILE' });
  }, []);
  const {
    openList,
    initInfo,
    openListProcess,
    openSubModal,
    openResult,
    result,
    callBack,
  } = modalData.modalState;
  useEffect(() => {
    if (!isConnected && !isConnecting) {
      navigator('/');
    }
  }, [isConnected, isConnecting]);

  const handleListOpen = useCallback(() => {
    modalData.modalDispatch({ type: 'CLOSE_LIST' });
  }, []);

  const handleListProcessOpen = useCallback(() => {
    modalData.modalDispatch({ type: 'CLOSE_LIST_PROCESS' });
  }, []);

  const handleDelistOpen = useCallback(() => {
    modalData.modalDispatch({ type: 'CLOSE_DELIST' });
  }, []);

  const handleResultOpen = useCallback(() => {
    modalData.modalDispatch({ type: 'CLOSE_RESULT' });
  }, []);
  const handleSubOpen = useCallback(() => {
    modalData.modalDispatch({ type: 'CLOSE_SUB_MODAL' });
  }, []);

  return (
    <>
      <Container flexDirection={'column'} justifyContent={'space-between'}>
        <Header />
        <Main>{children}</Main>
        <Footer />
      </Container>

      {openList && (
        <ListModal
          isOpen={openList}
          handleOpen={() => {
            handleListOpen();
          }}
          detail={initInfo}
        ></ListModal>
      )}

      {openListProcess && (
        <ListProcess
          isOpen={openListProcess}
          handleOpen={() => {
            handleListProcessOpen();
          }}
        ></ListProcess>
      )}
      {openSubModal && (
        <SubscribeModal
          isOpen={openSubModal}
          handleOpen={() => {
            handleSubOpen();
          }}
        ></SubscribeModal>
      )}

      <BuyIndex></BuyIndex>

      <ActionResult
        isOpen={openResult}
        handleOpen={() => {
          handleResultOpen();
        }}
        callBack={callBack}
        {...result}
      ></ActionResult>
      <WalletConnectModal
        isOpen={walletModalOpen}
        onClose={() => {
          handleModalClose();
        }}
      />
      {address && (
        <ProfileModal
          isOpen={openEditProfile}
          handleOpen={() => {
            handleEditProfileOpen();
          }}
          detail={profile}
        />
      )}
    </>
  );
}

const Main = styled.main`
  display: flex;
  flex: 1 1 0%;
  justify-content: center;
  margin-top: 80px;
`;

const Container = styled(Flex)`
  background-color: #333333;
  min-height: 100vh;
`;
