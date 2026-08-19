import React from 'react';

// Define the props interface for type safety
interface SuccessPopupProps {
  /** Boolean state to control the visibility of the popup. */
  isOpen: boolean;
  /** Function to set the state, typically passed as the 'setState' from useState. */
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function NewLeadPopup({ isOpen, setIsOpen }: SuccessPopupProps) {
  if (!isOpen) {
    return null;
  }

  // Function to close the popup
  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    // Backdrop overlay
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity duration-300">
      
      {/* Modal / Popup Container */}
      <div className="bg-white rounded-xl shadow-2xl p-6 w-11/12 max-w-sm transform scale-100 transition-transform duration-300">
        
        {/* Header & Close Button */}
        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
          
          {/* Success Icon & Title */}
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h3 className="text-lg font-semibold text-gray-800">Success</h3>
          </div>

          {/* Cross Button */}
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-150"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* Body Text */}
        <div className="mt-4">
          <p className="text-gray-600 text-base font-medium">
            New lead added successfully
          </p>
        </div>
      </div>
    </div>
  );
}