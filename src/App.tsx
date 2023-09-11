import { WagmiConfig, createClient, Chain, configureChains } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { ThemeProvider } from '@totejs/uikit';
import { bscTestnet } from 'wagmi/chains';
import Layout from './components/layout/Index';
import Home from './pages/Home';
import Profile from './pages/Profile';
import { ChannelDetail } from './pages/ChannelDetail';
import { FileDetail } from './pages/FileInfo';
import { theme } from './theme';
import { Route, Routes, HashRouter } from 'react-router-dom';
import { ModalProvider } from './context/modal';
import { GlobalProvider } from './context/global';
import { WalletModalProvider } from './context/walletModal';
import { OffChainAuthProvider } from './context/offchainAuthContext';
import { EditObject } from './components/object/Edit';

import './base/global.css';

import * as env from './env';

import RouteGuard from './router/index';

export interface IRoute {
  children?: Array<IRoute>;
  element?: React.ReactNode;
  index?: boolean;
  path?: string;
}

declare global {
  interface Window {
    trustWallet?: any;
    // zk.wasm export
    eddsaSign: any;
    FileHandle: any;
  }
}

const routes: Array<IRoute> = [
  {
    path: '/',
    element: <Home></Home>,
  },
  {
    path: '/channelList',
    element: <Profile></Profile>,
  },
  {
    path: '/edit',
    element: <EditObject></EditObject>,
  },
  {
    path: '/channel',
    element: <ChannelDetail></ChannelDetail>,
  },
  {
    path: '/file',
    element: <FileDetail></FileDetail>,
  },
];

const gfChain: Chain = {
  id: env.GF_CHAIN_ID,
  network: 'greenfield',
  rpcUrls: {
    default: {
      http: [env.GF_RPC_URL],
    },
    public: {
      http: [env.GF_RPC_URL],
    },
  },
  name: 'Greenfield Testnet',
  nativeCurrency: {
    name: 'tBNB',
    symbol: 'tBNB',
    decimals: 18,
  },
};

const { chains, provider } = configureChains(
  [bscTestnet, gfChain],
  [publicProvider()],
);

function App() {
  const client = createClient({
    autoConnect: true,
    connectors: [
      new MetaMaskConnector({ chains }),
      new InjectedConnector({
        chains,
        options: {
          name: 'Trust Wallet',
          shimDisconnect: true,
          getProvider: () => {
            try {
              if (
                typeof window !== 'undefined' &&
                typeof window?.trustWallet !== 'undefined'
              ) {
                // window.ethereum = window?.trustWallet;
                // eslint-disable-next-line
                Object.defineProperty(window.trustWallet, 'removeListener', {
                  value: window.trustWallet.off,
                });
                return window?.trustWallet;
              } else {
                return null;
              }
            } catch (e) {
              // eslint-disable-next-line no-console
              console.log(e);
            }
          },
        },
      }),
    ],
    provider,
    logger: {
      warn: (message: string) => console.log(message),
    },
  });
  return (
    <WagmiConfig client={client}>
      <ThemeProvider theme={theme}>
        <GlobalProvider>
          <ModalProvider>
            <WalletModalProvider>
              <OffChainAuthProvider>
                <HashRouter>
                  <Layout>
                    <Routes>
                      {routes.map((item: IRoute) => {
                        return (
                          <Route
                            key={item.path}
                            path={item.path}
                            element={<RouteGuard>{item.element}</RouteGuard>}
                          />
                        );
                      })}
                    </Routes>
                  </Layout>
                </HashRouter>
              </OffChainAuthProvider>
            </WalletModalProvider>
          </ModalProvider>
        </GlobalProvider>
      </ThemeProvider>
    </WagmiConfig>
  );
}

export default App;
