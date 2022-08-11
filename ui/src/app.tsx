import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AllListings } from './manage-listings/AllListings';
import { Apps } from './manage-listings/Apps';
import { Groups } from './manage-listings/Groups';
import { MyListings } from './manage-listings/MyListings';
import { Post } from './manage-listings/Post';
import { Search } from './pages/Search';
import { Splash } from './pages/Splash';
import { Create } from './pages/Create';
import { Board } from './pages/Board';
import { Tag } from './pages/Tag';

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename='/apps/quorum'>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Splash />} />
            <Route path="/create" element={<Create />} />
            <Route path="/join" element={<Create />} />
            <Route path="/board/:planet/:name" element={<Board />} />
            <Route path="/search" element={<Search />} />
            <Route path="/search/:lookup" element={<Search />} />
            <Route path="/search/:lookup/:limit/:page" element={<Search />} />
            <Route path="/tags" element={<Tag />} />
            <Route path="/tags/:tag" element={<Tag />} />
            <Route path="/tags/:tag/:limit/:page" element={<Tag />} />
            <Route path="/manage-listings">
              <Route index element={<MyListings />} />
              <Route path="all" element={<AllListings />} />
              <Route path="all/:limit/:page" element={<AllListings />} />
              <Route path="post" element={<Post />} />
              <Route path="apps" element={<Apps />} />
              <Route path="groups" element={<Groups />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
