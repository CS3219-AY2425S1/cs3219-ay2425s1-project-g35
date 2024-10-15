import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import QuestionTable from './components/QuestionTable';
import LoginPage from './views/login-page/LoginPage';
import MainPage from './views/main-page/MainPage';
import RegisterPage from './views/register-page/RegisterPage';
import MatchingPage from './views/matching-page/MatchingPage';

import styles from './App.module.css';

function App() {
  return (
    <div className={styles.App}>
      <Router>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<MainPage />}>
              <Route index element={<QuestionTable />} /> 
              <Route path='/matching' element={<MatchingPage /> } />
            </Route>
          </Route>

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;

