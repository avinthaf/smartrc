import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter, Routes, Route } from 'react-router';

import Login from './pages/login.tsx';
import Signup from './pages/signup.tsx';
import ResetPassword from './pages/reset-password.tsx';
import SetNewPassword from './pages/set-new-password.tsx';
import Interests from './pages/interests.tsx';
import FlashcardDeck from './pages/flashcards.deck.tsx';
import FlashcardsMaker from './pages/flashcards.make.tsx';
import FlashcardsGame from './pages/flashcards_game.tsx';
import AuthProvider from './providers/AuthProvider.tsx';
import MyActivity from './pages/my_activity.tsx';
import MainLayout from './layouts/main.layout.tsx';
import Flashcards from './pages/flashcards.index.tsx';
import FillInBlanks from './pages/fill_in_the_blanks.index.tsx';
import FillInTheBlanksDeck from './pages/fill_in_the_blanks_deck.tsx';
import { ThemeProvider } from './theme/provider.tsx';
import FillInBlanksMaker from './pages/fill_in_the_blanks.make.tsx';
import ScrollToTop from './components/ScrollToTop';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ScrollToTop />
        <Routes>
          <Route element={<AuthProvider />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<App />} />
              <Route path="/flashcards" element={<Flashcards />} />
              <Route path="/flashcards/:deckId/session/:sessionId" element={<FlashcardDeck />} />
              <Route path="/flashcards/make" element={<FlashcardsMaker />} />
              <Route path="/flashcards/game" element={<FlashcardsGame />} />

              <Route path="/fill-in-the-blanks" element={<FillInBlanks />} />
              <Route path="/fill-in-the-blanks/:deckId/session/:sessionId" element={<FillInTheBlanksDeck />} />
              <Route path="/fill-in-the-blanks/make" element={<FillInBlanksMaker />} />

              <Route path="/my-activity" element={<MyActivity />} />
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/set-new-password" element={<SetNewPassword />} />
            <Route path="/onboarding/interests" element={<Interests />} />
          </Route>
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
