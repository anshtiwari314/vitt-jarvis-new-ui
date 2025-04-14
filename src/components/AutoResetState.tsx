import React,{ useState, useEffect } from "react";

const AutoResetState = ({isActive, setIsActive,time}) => {
  

  useEffect(() => {
    let timer;
    if (isActive) {
      timer = setTimeout(() => {
        setIsActive(false);
        console.log("State reset to false after 10s!");
      }, time); // 10 seconds
    }
    return () => clearTimeout(timer); // Cleanup on unmount
  }, [isActive]);

  return (
    <div>
      <h3>State: {isActive ? "✅ Active" : "❌ Inactive"}</h3>
      <button onClick={() => setIsActive(true)}>Activate</button>
    </div>
  );
};

export default AutoResetState;