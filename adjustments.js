return {
    listening,
    errored,
    loading,
    userSpeaking,
    pause,
    start,
    toggle,
    micVAD: vad,
  }

  //if want to print runtime option for vad2 (vad-react) , u have to modify node_modules with this   

  frame_duration_seconds = (frameSamples * minSpeechFrames) / 16000
frame_duration_ms = (frameSamples * minSpeechFrames / 16000) * 1000

minSpeechFrames = ceil(target_ms / (frameSamples / 16))


// legacy is performing better 
{
    frameSamples : 1536 ,
    minSpeechFrames:3,
    positiveThresold: 0.5 , 
    negativeThresold : 0.35 ,
    redemptionFrames: 8,
    preSpeechFrame:1 
}

// legacy is performing better 
{
    frameSamples : 1536 ,
    minSpeechFrames:3,
    positiveThresold: 0.5 , 
    negativeThresold : 0.35 ,
    redemptionFrames: 8,
    preSpeechFrame:1 
}

//v5 

{
    frameSamples : 512 , // bcz if this two params v5 is misbehaving
    minSpeechFrames:9,// bcz if this two params v5 is misbehaving
    positiveThresold: 0.5 , 
    negativeThresold : 0.35 ,
    redemptionFrames: 24,
    preSpeechFrame:3 

}