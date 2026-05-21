export const config =  {
    greet:'hello',

    // Base websocket server URL. The client will append `wsEndpoint` when no path is present.
    // Example production value: 'https://your-domain.com'
    wsUrl:'wss://recruito.vitti.insure',
    wsEndpoint:'/ai_suggestion_req_ins_v2',
    serverBaseUrl : 'https://recruito.vitti.insure/lms_router',

    //serverBaseUrl: 'https://eeabca1560e3.ngrok-free.app',
    postfactoUrl : 'https://postfacto.netlify.app'
}
