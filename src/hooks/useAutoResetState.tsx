import { useState, useEffect } from "react";

const useAutoResetState = (initialValue = false, duration = 15000) => {
  const [state, setState] = useState(initialValue);

  useEffect(() => {
    let timer;
    if (state) {
      timer = setTimeout(() => {
        setState(false);
        console.log("State reset to false after", duration / 1000, "seconds");
      }, duration);
    }
    return () => clearTimeout(timer); // Cleanup function
  }, [state, duration]);

  return [state, setState];
};

export default useAutoResetState;