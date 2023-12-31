import styled from '@emotion/styled';
import { NavBar } from '../NavBar';
import { useCallback } from 'react';
import { Box } from '@totejs/uikit';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AllList from './All';
import TrendingList from './Trending';

enum Type {
  All = 'all',
  Trending = 'trending',
}
const navItems = [
  {
    name: 'Trending Channels',
    key: Type.Trending,
  },
  {
    name: 'All Users',
    key: Type.All,
  },
];

const HomeList = () => {
  const [p] = useSearchParams();
  const tab = p.getAll('tab')[0];

  const navigator = useNavigate();
  const currentTab = tab ? tab : Type.Trending;
  const handleTabChange = useCallback((tab: any) => {
    navigator(`/?tab=${tab}`);
  }, []);
  console.log(currentTab);

  return (
    <Container>
      <NavBar active={currentTab} onChange={handleTabChange} items={navItems} />
      <Box h={20} />
      {currentTab === 'all' ? (
        <AllList></AllList>
      ) : (
        <TrendingList></TrendingList>
      )}
    </Container>
  );
};

export default HomeList;

const Container = styled.div`
  margin-top: 30px;
  padding-top: 60px;
  width: 1123px;
`;
