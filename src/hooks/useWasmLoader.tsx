import { useState, useEffect } from "react";

const useWasmLoader = (wasmUrl) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadWasm = async () => {
      try {
        const response = await fetch(wasmUrl);
        const bytes = await response.arrayBuffer();

        const imports = {
          a: {} // ✅ Provide an empty object if "a" is required
        };

        const { instance } = await WebAssembly.instantiate(bytes, imports);

        if (isMounted) {
          console.log("WASM Loaded:", instance);
          setIsLoaded(true);
        }
      } catch (error) {
        console.error("Error loading WebAssembly:", error);
        setIsLoaded(false);
      }
    };

    loadWasm();

    return () => {
      isMounted = false;
    };
  }, [wasmUrl]);

  return isLoaded;
};

export default useWasmLoader;