import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import MobileTabBar from './MobileTabBar';
import FloatingComplaintButton from '../common/FloatingComplaintButton';

const LandingLayout = () => {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <MobileTabBar />
      <FloatingComplaintButton />
    </div>
  );
};

export default LandingLayout;