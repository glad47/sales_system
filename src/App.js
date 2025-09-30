// src/App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import MainPage from './components/MainPage';
import Users from './components/Users';
import UserDetail from './components/UserDetail';
import Bills from './components/Bills';
import BillDetail from './components/BillDetail';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/*" element={<MainPage />} />
      </Routes>
    </Router>
  );
}

export default App;

