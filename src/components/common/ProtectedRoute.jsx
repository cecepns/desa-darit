import { Navigate } from 'react-router-dom';
import { getStorageItem } from '../../utils/helpers';

const ProtectedRoute = ({ children }) => {
  const token = getStorageItem('token');
  const user = getStorageItem('user');

  if (!token || !user) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default ProtectedRoute;