import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RoutesPage from './pages/RoutesPage';
import AdminPage from './pages/AdminPage';
import WalkthroughPage from './pages/WalkthroughPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoutesPage />} />
        <Route path="/admin/new" element={<AdminPage />} />
        <Route path="/admin/:id" element={<AdminPage />} />
        <Route path="/walk/:id" element={<WalkthroughPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
