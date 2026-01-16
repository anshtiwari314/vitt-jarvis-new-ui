import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const AppPromoPopup = () => {
  const [showPromo, setShowPromo] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  const qpParams = useSelector((state: any) => state.qpReducer);

  const APP_SCHEME = `vittapp://open/?customer_id=${qpParams.customer_id}&name=${qpParams.name}`;
  const APK_LINK = "https://pub-1533a88ddd064ef095a7014edc100177.r2.dev/base-version2/app-release.apk"; 

  
  console.log("QP PARAMS IN APP PROMO POPUP:", qpParams);
  useEffect(() => {
    const checkVisibility = () => {
      // 1. Get the stored timestamp
      const dismissedTime = localStorage.getItem('vittapp_promo_dismissed');
      const isMobileOrTablet = window.innerWidth <= 1024;
      
      // 2. Define half Hour in milliseconds
      const ONE_HOUR = 60 * 30 * 1000; 
      const now = Date.now();

      let shouldShow = false;

      if (isMobileOrTablet) {
        if (!dismissedTime) {
          // Case A: User never dismissed it -> SHOW
          shouldShow = true;
        } else {
          // Case B: User dismissed it previously
          // Check if difference between NOW and STORED time is > 1 Hour
          if (now - parseInt(dismissedTime) > ONE_HOUR) {
            shouldShow = true;
          }
        }
      }

      if (shouldShow) {
        // Small delay for UX
        const timer = setTimeout(() => setShowPromo(true), 1500);
        return () => clearTimeout(timer);
      }
    };

    checkVisibility();
  }, []);

  const handleOpenApp = () => {
    window.location.href = APP_SCHEME;

    setTimeout(() => {
      if (!document.hidden) {
        setShowPromo(false);
        setShowDownloadModal(true);
      }
    }, 2000);
  };

  const handleDismissPromo = () => {
    setShowPromo(false);
    // CHANGE: Save the CURRENT TIMESTAMP instead of just "true"
    localStorage.setItem('vittapp_promo_dismissed', Date.now().toString());
  };

  // ... (Render logic remains exactly the same as before) ...

  if (showDownloadModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-xl p-6 text-center shadow-2xl">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">App Not Installed</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">It looks like the app is not installed. Please download it below:</p>
          <a href={APK_LINK} className="block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg" download>Download APK</a>
          <button onClick={() => setShowDownloadModal(false)} className="mt-4 text-sm text-gray-500 underline">Close</button>
        </div>
      </div>
    );
  }

  if (showPromo) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
        <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-2xl shadow-2xl p-6 text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4"><span className="text-3xl">📱</span></div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Open in VittApp?</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">The app is faster and smoother.</p>
          <div className="space-y-3">
            <button onClick={handleOpenApp} className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg">Open App</button>
            <button onClick={handleDismissPromo} className="w-full py-3 px-4 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 font-medium rounded-xl">Continue in Browser</button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default AppPromoPopup;