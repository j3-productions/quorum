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
import { Join } from './pages/Join';
import { Board } from './pages/Board';
import { Question } from './pages/Question';
import { Settings } from './pages/Settings';
import { Thread } from './pages/Thread';
import { Answer } from './pages/Answer';

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename='/apps/quorum'>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Splash />} />
            <Route path="/create" element={<Create />} />
            <Route path="/join" element={<Join />} />
            {/*<Route path="/board/" element={<Board />} />*/}
            {/*<Route path="/board/:planet" element={<Board />} />*/}
            <Route path="/board/:planet/:name" element={<Board />} />
            <Route path="/board/:planet/:name/question" element={<Question />} />
            <Route path="/board/:planet/:name/settings" element={<Settings />} />
            <Route path="/board/:planet/:name/thread/:tid" element={<Thread />} />
            <Route path="/board/:planet/:name/thread/:tid/answer" element={<Answer />} />
            <Route path="/search/:lookup" element={<Search />} />
            <Route path="/search/:lookup/:limit/:page" element={<Search />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
