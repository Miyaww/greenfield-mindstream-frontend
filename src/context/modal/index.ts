import { StateModalVariantType } from '@totejs/uikit';
import React from 'react';
import { IGroupItem } from '../../base/type';

export const initialState: any = {
  openList: false,
  openListProcess: false,
  openBuy: false,
  buying: false,
  openSub: false,
  uploading: false,
  openDelist: false,
  openResult: false,
  openCreateChannel: false,
  openEditProfile: false,
  openSubModal: false,
  channelList: [],
  listData: {},
  buyData: {},
  initInfo: {},
  delistData: {},
  selectedGroup: {},
  activeGroup: {
    groupName: '',
    groupId: '',
    ownerAddress: '',
  },
  result: {},
  initListStatus: 0,
  initListResult: {},
  profile: {},
  subItem: {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  callBack: () => {},
};

export const defaultState: any = JSON.parse(JSON.stringify(initialState));

export interface ModalState {
  modalState: {
    openList: boolean;
    openListProcess: boolean;
    openBuy: boolean;
    buying: boolean;
    openSub: boolean;
    uploading: boolean;
    listData: object;
    buyData: object;
    initInfo: object;
    initListStatus: number;
    initListResult: object;
    openDelist: boolean;
    openSubModal: boolean;
    delistData: object;
    openResult: boolean;
    openCreateChannel: boolean;
    channelList: [];
    openEditProfile: boolean;
    profile: object;
    subItem: object;
    selectedChannelList: object;
    selectedChannel: object;
    activeGroup: IGroupItem;
    result: {
      variant: StateModalVariantType;
      description: string;
    };
    callBack: () => void;
  };
  modalDispatch: React.Dispatch<any>;
}

export const ModalContext = React.createContext<ModalState>(null as any);
ModalContext.displayName = 'ModalContext';

export const ModalReducer = (initialState: any, action: any) => {
  switch (action.type) {
    case 'OPEN_LIST':
      return {
        ...initialState,
        openList: true,
        initInfo: action.initInfo,
      };
    case 'CLOSE_LIST':
      return { ...initialState, openList: false };
    case 'OPEN_LIST_PROCESS':
      return {
        ...initialState,
        openListProcess: true,
        openList: false,
        listData: action.listData,
      };
    case 'CLOSE_LIST_PROCESS':
      return {
        ...initialState,
        openListProcess: false,
      };
    case 'UPDATE_LIST_DATA':
      return { ...initialState, listData: action.listData };
    case 'OPEN_CHANNEL_PROCESS':
      return {
        ...initialState,
        openChannelProcess: true,
        openChannel: false,
        channelData: action.channelData,
      };
    case 'CLOSE_CHANNEL_PROCESS':
      return {
        ...initialState,
        openChannelProcess: false,
      };
    case 'SET_ACTIVE_CHANNEL_LIST':
      return {
        ...initialState,
        selectedChannelList: action.selectedChannelList,
      };
    case 'SET_ACTIVE_GROUP':
      return {
        ...initialState,
        activeGroup: action.activeGroup,
      };
    case 'SET_ACTIVE_CHANNEL':
      return {
        ...initialState,
        selectedChannel: action.selectedChannel,
      };
    case 'UPDATE_CHANNEL_STATUS':
      return {
        ...initialState,
        initListStatus: action.initListStatus,
        initListResult: action.initListResult,
        channelData: action.channelData || initialState.channelData,
      };
    case 'OPEN_BUY':
      return {
        ...initialState,
        openBuy: true,
        buyData: action.buyData,
      };
    case 'BUYING':
      return {
        ...initialState,
        buying: true,
        openBuy: false,
      };
    case 'CLOSE_BUY':
      return {
        ...initialState,
        openBuy: false,
      };
    case 'OPEN_DELIST':
      return {
        ...initialState,
        openDelist: true,
        delistData: action.delistData,
      };
    case 'CLOSE_DELIST':
      return {
        ...initialState,
        openDelist: false,
      };
    case 'OPEN_RESULT':
      return {
        ...initialState,
        openList: false,
        openListProcess: false,
        openListError: false,
        openBuy: false,
        buying: false,
        openDelist: false,
        openResult: true,
        result: action.result,
        callBack: action.callBack,
      };
    case 'CLOSE_RESULT':
      return {
        ...initialState,
        openResult: false,
      };
    case 'RESET':
      return defaultState;
    case 'OPEN_PROFILE':
      return {
        ...initialState,
        openEditProfile: true,
        profile: action.profile,
      };
    case 'CLOSE_PROFILE':
      return { ...initialState, openEditProfile: false };
    case 'OPEN_SUB_MODAL':
      return {
        ...initialState,
        openSubModal: true,
        subItem: action.subItem,
      };
    case 'CLOSE_SUB_MODAL':
      return { ...initialState, openSubModal: false };
    default:
      return initialState;
  }
};

export * from './Provider';
