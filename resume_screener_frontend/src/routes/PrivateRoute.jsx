import { Navigate } from 'react-router-dom';
import { getCurrentUser } from '../mock/auth';

const PrivateRoute = ({ children, allowedRole }) => {
  const user = getCurrentUser();
  if (!user) return <Navigate to="/login" />;
  if (user.role !== allowedRole) return <Navigate to="/" />;
  return children;
};

export default PrivateRoute;
