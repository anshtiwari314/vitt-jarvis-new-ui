export const config = {
    greet:'hello',
    // Base websocket server URL. The client will append `wsEndpoint` when no path is present.
    // Example production value: 'https://your-domain.com'
    wsUrl:'http://localhost:5000',
    //wsUrl:'wss://recruito.vitti.insure',

    // WebSocket stream route — enable exactly one (prod OR dev)
    //kotak_prod_stream_req: 'kotak_prod_stream_req',
    dev_stream_req: 'ai_suggestion_req_ins_v2',

    //NetworkManager health ping — enable exactly one (prod OR dev)
    //kotak_prod_ping: '/kotak_prod_ping',
    dev_ping: '/ping',

    serverBaseUrl : 'https://recruito.vitti.insure/lms_router',
    //serverBaseUrl:'https://77b1-2406-b400-b1-45df-a501-9845-9c47-bfd0.ngrok-free.app/main_router',
    //serverBaseUrl: 'https://eeabca1560e3.ngrok-free.app',
    postfactoUrl : 'https://postfacto.netlify.app'
}

/** Resolved WebSocket stream path — uses whichever of prod or dev is set in config. */
export const wsEndpoint = config.kotak_prod_stream_req ?? config.dev_stream_req ?? ''

/** Resolved NetworkManager ping path — uses whichever of prod or dev is set in config. */
export const networkManagerPingRoute = config.kotak_prod_ping ?? config.dev_ping ?? '/ping'
