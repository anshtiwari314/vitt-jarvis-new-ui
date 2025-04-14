import React,{useState,useEffect} from 'react'

export default function WasmChecker({ wasmUrls }){
    const [status, setStatus] = useState({});
  
    useEffect(() => {
      const checkWasmLoaded = async (url) => {
        try {
          const response = await fetch(url, { method: "HEAD" });
          return response.ok; // Returns true if file exists
        } catch (error) {
          console.error(`Error checking ${url}:`, error);
          return false;
        }
      };
  
      const checkAllWasmFiles = async () => {
        const results = {};
        for (let url of wasmUrls) {
          results[url] = await checkWasmLoaded(url);
        }
        setStatus(results);
      };
  
      checkAllWasmFiles();
    }, [wasmUrls]);
  
    return (
      <div>
        <h3>WASM File Status:</h3>
        <ul>
          {wasmUrls.map((url) => (
            <li key={url}>
              {url}:{" "}
              {status[url] === undefined ? (
                <span>Checking...</span>
              ) : status[url] ? (
                <span style={{ color: "green" }}>✅ Loaded</span>
              ) : (
                <span style={{ color: "red" }}>❌ Not Found</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  };