## current logic 
when mic icon in header clicked the VAD2 starts & once the data is coming from onSpeechEnd will send it to backend 

## updation in logic 

when mic icon clicked 

VAD2 starts (i commented the send it to server logic)


a media recorder instance is created & from a mic stream & send the stream to backend server on every 4s intervals 

if mic is paused at any time for eg 2s then 2s of data will be send to server & it will immediately paused before sending

in every 4s a new mediarecorder instance will be created.  

u have to add this mediarecorder logic also in code along with current VAD2 setup

if have any doubts u can confirm from me otherwise proceed 

