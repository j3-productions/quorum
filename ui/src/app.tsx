import React from 'react';
import api from './api';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { Layout } from './components/Layout';
import { Splash, Search, Board, Thread } from './pages/Views';
import { Create, Join, Question, Answer, Settings } from './pages/Forms';

// const queryClient = new QueryClient();

export function App() {
  // TODO: Consider using 'QueryClientProvider' for search.
  //
  // <QueryClientProvider client={queryClient}>
  // </QueryClientProvider>

  return (
      <BrowserRouter basename='/apps/quorum'>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Splash />} />
            <Route path="/create" element={<Create />} />
            <Route path="/join" element={<Join />} />
            {/*<Route path="/board/:planet" element={<Board />} />*/}
            <Route path="/board/:planet/:board" element={<Board />} />
            <Route path="/board/:planet/:board/question" element={<Question />} />
            <Route path="/board/:planet/:board/settings" element={<Settings />} />
            <Route path="/board/:planet/:board/thread/:tid" element={<Thread />} />
            <Route path="/board/:planet/:board/thread/:tid/answer" element={<Answer />} />
            <Route path="/search/:planet/:board/:lookup" element={<Search />} />
            {/*<Route path="/search/:lookup/:limit/:page" element={<Search />} />*/}
          </Route>
        </Routes>
      </BrowserRouter>
  )
}
