import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/redux';

// Redirect /sell to /dashboard for sellers (avoids confusion)
const Sell = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      // Redirect to dashboard where sellers see their dashboard
      navigate('/dashboard', { replace: true });
    } else {
      // If not authenticated, redirect to login
      navigate('/auth', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return null;
};

export default Sell;

