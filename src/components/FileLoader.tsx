import React,{ useState, useEffect } from "react";

const FileLoadChecker = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const handleLoad = () => {
      setIsLoaded(true);
    };

    if (document.readyState === "complete") {
      setIsLoaded(true);
    } else {
      window.addEventListener("load", handleLoad);
    }

    return () => {
      window.removeEventListener("load", handleLoad);
    };
  }, []);

  return (
    <div>
      {isLoaded ? (
        <h2 style={{ color: "green" }}>All files are loaded ✅</h2>
      ) : (
        <h2 style={{ color: "red" }}>Loading files... ⏳</h2>
      )}
    </div>
  );
};

export default FileLoadChecker;