import React from 'react';
import LoadingIcons, { 
  Audio, BallTriangle, Bars, Circles, Grid, Hearts, Oval, 
  Puff, Rings, SpinningCircles, TailSpin, ThreeDots 
} from 'react-loading-icons';


const LoadingIconsDisplay = () => {
   
    return (
    <div className="flex flex-col items-center space-y-4 p-4">
      <h2 className="text-2xl font-bold">Loading Icons Showcase</h2>
      <div className="grid grid-cols-3 gap-6 p-4">
      <LoadingIcons.Bars style={{backgroundColor:'red'}}/>
        <Audio stroke="red"/><span>Audio</span>
        <BallTriangle stroke="red"/><span>BallTriangle</span>
        <Bars stroke="red"/><span>Bars</span>
        <Circles stroke="red"/><span>Circles</span>
        <Grid stroke="red"/><span>Grid</span>
        <Hearts stroke="red"/><span>Hearts</span>
        <Oval stroke="red"/><span>Oval</span>
        <Puff stroke="red"/><span>Puff</span>
        <Rings stroke="red"/><span>Rings</span>
        <SpinningCircles stroke="red" strokeOpacity={1} speed={.95}/><span>SpinningCircles</span>
        <TailSpin stroke="red"/><span>TailSpin</span>
        <ThreeDots stroke="red" strokeOpacity={1} speed={.95}/><span>ThreeDots</span>
      </div>
    </div>
  );
};

export default LoadingIconsDisplay;