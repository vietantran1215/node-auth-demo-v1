import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import NavBar from './components/NavBar';
import PrivateRoute from './components/PrivateRoute';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import Dashboard from './pages/Dashboard';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <NavBar />
        <Container className="py-4">
          <Routes>
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected Routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
            
            {/* Redirect to login if no route matches */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </Container>
      </div>
    </BrowserRouter>
  );
}

export default App;
