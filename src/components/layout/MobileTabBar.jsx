import { NavLink, useLocation } from 'react-router-dom';
import { Home, Newspaper, ShoppingBag, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import ComplaintForm from '../common/ComplaintForm';

const MobileTabBar = () => {
  const location = useLocation();
  const [isComplaintFormOpen, setIsComplaintFormOpen] = useState(false);

  const tabs = [
    { to: '/', label: 'Beranda', Icon: Home, exact: true },
    { to: '/berita', label: 'Berita', Icon: Newspaper },
    { to: '/belanja', label: 'Belanja', Icon: ShoppingBag },
  ];

  const isActivePath = (to, exact) => {
    if (exact) return location.pathname === to;
    return location.pathname === to || location.pathname.startsWith(`${to}/`);
  };

  return (
    <>
      <nav className="md:hidden fixed inset-x-0 bottom-0 z-50">
        <div className="mx-auto max-w-screen-sm px-4 pb-[max(env(safe-area-inset-bottom),0px)]">
          <div className="bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 border border-gray-200 shadow-lg rounded-2xl mb-3">
            <ul className="grid grid-cols-4">
              {tabs.map(({ to, label, Icon, exact }) => {
                const active = isActivePath(to, exact);
                return (
                  <li key={to}>
                    <NavLink
                      to={to}
                      className="flex flex-col items-center justify-center py-2.5 gap-1"
                    >
                      <Icon
                        size={22}
                        className={active ? 'text-blue-600' : 'text-gray-500'}
                        strokeWidth={active ? 2.6 : 2}
                      />
                      <span className={active ? 'text-xs font-medium text-blue-700' : 'text-xs text-gray-600'}>
                        {label}
                      </span>
                    </NavLink>
                  </li>
                );
              })}
              
              {/* Complaint Button */}
              <li>
                <button
                  onClick={() => setIsComplaintFormOpen(true)}
                  className="flex flex-col items-center justify-center py-2.5 gap-1 w-full"
                >
                  <MessageSquare
                    size={22}
                    className="text-gray-500"
                    strokeWidth={2}
                  />
                  <span className="text-xs text-gray-600">
                    Pengaduan
                  </span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Complaint Form Modal */}
      <ComplaintForm 
        isOpen={isComplaintFormOpen} 
        onClose={() => setIsComplaintFormOpen(false)} 
      />
    </>
  );
};

export default MobileTabBar;


