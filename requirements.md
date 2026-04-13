## implementation of play audio

1. in this project the voice implementation has been done ,/home/anuj/Desktop/vitt-temp/tablet-app/VadBaseUseCaseWs (that project is read-only) & present in dataWrapper
receiveData function -> const {arr,audiourl}=handleData(result)

2. i want , there will be an speaker icon prsent in right of mic icon (mic icon triggers VAD2 on or off, present after skip pfr btn) 

3. the functionality which i m trying to implement is i will receive audio in form of url or base64 (try read handleData fn) & it will start playing if no other previous audio is playing , if audio is already playing then append it in a queue & wait for it until previous audio is finished playing then another audio from queue will start playing 

4. if mic is on (means vad2 is listening) at that time if audio is playing & audio detect speech then audio play will be stopped 


5. if vad2 misfired at that case audio will resume playing from that point & queue will not be cleared 

6. if vad2 give the audio data at speech-end , then assume user has speaked something relevant & queue will be cleared & audio will stop (btw its already stopped when vad detect speech , until received another base64 or audiourl from backend server) 

7. start implementing the same feature in this project 





