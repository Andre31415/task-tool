import { useEffect } from 'react';
import { useStore } from './store/useStore';
import { Login } from './components/Auth/Login';
import { Dashboard } from './components/Dashboard/Dashboard';

function App() {
  const { user, setUser } = useStore();

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = useStore.getState().user;
    if (currentUser) {
      setUser(currentUser);
    }
  }, [setUser]);

  if (!user) {
    return <Login />;
  }

  return <Dashboard />;
}

export default App;
