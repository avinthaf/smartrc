import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter, Routes, Route } from 'react-router';

import Login from './pages/login.tsx';
import Signup from './pages/signup.tsx';
import Interests from './pages/interests.tsx';
import Flashcards from './pages/flashcards.tsx';
import FlashcardsMaker from './pages/flashcards_make.tsx';
import FlashcardsGame from './pages/flashcards_game.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/onboarding/interests" element={<Interests />} />
      <Route path="/flashcards" element={<Flashcards />} />
      <Route path="/flashcards/make" element={<FlashcardsMaker />} />
      <Route path="/flashcards/game" element={<FlashcardsGame />} />
    </Routes>
    </BrowserRouter>
  </StrictMode>,
)
