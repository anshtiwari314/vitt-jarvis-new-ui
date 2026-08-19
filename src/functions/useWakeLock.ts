import { useEffect,useRef } from "react";

type WakeLockSentinel = WakeLockSentinel ;

export function useWakeLock(enabled = true){
    const sentinelRef = useRef<WakeLockSentinel | null>(null);

    useEffect(()=>{
        if(!enabled || !('wakeLock' in navigator)) return ;
        
        let cancelled = false ;

        const requestLock = async ()=>{
            if(cancelled || document.visibilityState !== 'visible') return ;

            try{
                await sentinelRef.current?.release();
                const sentinel= await navigator.wakeLock.request('screen');
            
                if(cancelled ){
                    await sentinel.release();
                    return ;
                }

                sentinelRef.current = sentinel;
            }catch(err){
                console.log('wake lock req failed')
            }
        };

        const onVisibilityChange = ()=>{
            if(document.visibilityState === 'visible'){
                requestLock();
            }


        }

        requestLock();
        document.addEventListener('visibilitychange',onVisibilityChange)
        return ()=>{
            cancelled = true;
            document.removeEventListener('visibilitychange',onVisibilityChange)
            sentinelRef.current?.release().catch(()=>{})
        }
    },[enabled])
}