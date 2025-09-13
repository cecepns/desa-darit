import { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import ComplaintForm from './ComplaintForm';

const FloatingComplaintButton = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <>
      {/* Floating Button - Desktop Only */}
      <div className="hidden md:block fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsFormOpen(true)}
          className="group bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          aria-label="Buka form pengaduan"
        >
          <MessageSquare className="w-6 h-6" />
          
          {/* Tooltip */}
          <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
            Laporkan Pengaduan
            <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
          </div>
        </button>
      </div>

      {/* Complaint Form Modal */}
      <ComplaintForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
      />
    </>
  );
};

export default FloatingComplaintButton;
