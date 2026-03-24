import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import CandidatesPage from './pages/CandidatesPage';
import CustomerManagementPage from './pages/CustomerManagementPage';
import Dashboard from './pages/Dashboard';
import ModulePage from './pages/ModulePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/hanh-chinh" element={<ModulePage />} />
          <Route path="/ban-hang/khach-hang" element={<CustomerManagementPage />} />
          <Route path="/nhan-su" element={<ModulePage />} />
          <Route path="/nhan-su/ung-vien" element={<CandidatesPage />} />
          <Route path="/kho-van" element={<ModulePage />} />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
