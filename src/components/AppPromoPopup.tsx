import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

const AppPromoPopup = () => {
  const [showPromo, setShowPromo] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  
  // We use a ref to prevent double-firing strict mode or re-renders
  const attemptMade = useRef(false);

  const qpParams = useSelector((state) => state.qpReducer);

  // Ensure params exist to prevent 'undefined' in URL
  const customerId = qpParams?.customer_id || "";
  const name = qpParams?.name || "";

  const APP_SCHEME = `vittapp://open?customer_id=${customerId}&name=${name}`;
  const APK_LINK = "https://pub-1533a88ddd064ef095a7014edc100177.r2.dev/base-version1/app-release.apk"; 

  useEffect(() => {
    const performAutoCheck = () => {
      // 1. Basic Checks (Mobile & Not Dismissed)
      const dismissedTime = localStorage.getItem('vittapp_promo_dismissed');
      const isMobileOrTablet = window.innerWidth <= 1024;
      const ONE_HOUR = 60 * 30 * 1000; 
      const now = Date.now();

      let shouldAttempt = false;

      if (isMobileOrTablet) {
        if (!dismissedTime) {
          shouldAttempt = true;
        } else {
          // If dismissed more than 30 mins ago, try again
          if (now - parseInt(dismissedTime) > ONE_HOUR) {
            shouldAttempt = true;
          }
        }
      }

      // 2. The "Try First" Logic
      if (shouldAttempt && !attemptMade.current) {
        attemptMade.current = true; // Mark as attempted so we don't loop
        
        // A. Try to open the app immediately
        window.location.href = APP_SCHEME;

        // B. Wait 2 seconds to see if it worked
        setTimeout(() => {
          // If the document is STILL visible, the app failed to open.
          if (!document.hidden) {
            setShowPromo(true); // Show the "Ask" popup
          }
        }, 2000);
      }
    };

    performAutoCheck();
  }, [APP_SCHEME]); // Dependency ensures we have the correct link

  // --- HANDLERS ---

  const handlePromoOpenAppClick = () => {
    // User clicked "Open App" in the promo popup.
    // Since the auto-check (Step 1) already failed, we assume they need the APK.
    setShowPromo(false);
    setShowDownloadModal(true);
  };

  const handleDismissPromo = () => {
    setShowPromo(false);
    localStorage.setItem('vittapp_promo_dismissed', Date.now().toString());
  };

  // --- RENDER ---

  // 1. Download Modal (Final Step)
  if (showDownloadModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-xl p-6 text-center shadow-2xl">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">App Not Installed</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">It looks like the app is not installed. Please download it below:</p>
          
          <a href={APK_LINK} className="block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg" download>
            Download APK
          </a>
          
          <button onClick={() => setShowDownloadModal(false)} className="mt-4 text-sm text-gray-500 underline">Close</button>
        </div>
      </div>
    );
  }

  // 2. Promo Popup (Fallback Step)
  if (showPromo) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
        <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-2xl shadow-2xl p-6 text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">📱</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Open in VittApp?</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">The app is faster and smoother.</p>
          
          <div className="space-y-3">
            {/* Click here now leads to Download Modal */}
            <button 
              onClick={handlePromoOpenAppClick} 
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg"
            >
              Open App
            </button>
            
            <button 
              onClick={handleDismissPromo} 
              className="w-full py-3 px-4 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 font-medium rounded-xl"
            >
              Continue in Browser
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default AppPromoPopup;