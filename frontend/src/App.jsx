import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import QuestionTable from './components/QuestionTable';
import LoginPage from './views/login-page/LoginPage';
import MainPage from './views/main-page/MainPage';
import RegisterPage from './views/register-page/RegisterPage';
import MatchingPage from './views/matching-page/MatchingPage';

import styles from './App.module.css';
import CollaborationPage from './views/collaboration-page/CollaborationPage';
import ProfilePage from './views/profile-page/ProfilePage';

function App() {
  return (
    <div className={styles.App}>
      <Router>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/cs3219-ay2425s1-project-g35/" element={<MainPage />}>
              {/* <Route index element={<QuestionTable />} />  */}
              <Route path='/cs3219-ay2425s1-project-g35/' element={<MatchingPage />} />
              <Route path="/cs3219-ay2425s1-project-g35/collab/:roomId" element={<CollaborationPage />} />
              <Route path="/cs3219-ay2425s1-project-g35/profile" element={<ProfilePage />} />
            </Route>
          </Route>

          <Route path="/cs3219-ay2425s1-project-g35/login" element={<LoginPage />} />
          <Route path="/cs3219-ay2425s1-project-g35/register" element={<RegisterPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;

