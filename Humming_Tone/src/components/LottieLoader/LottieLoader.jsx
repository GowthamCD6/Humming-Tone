import React from 'react';
import { useLottie } from 'lottie-react';
import loadingAnimation from '../../animation/loading.json';
import './LottieLoader.css';

export const LottieLoader = ({ size = 160, message = '' }) => {
  const options = {
    animationData: loadingAnimation,
    loop: true,
    autoplay: true,
  };

  const style = {
    width: size,
    height: size,
  };

  const { View } = useLottie(options, style);

  return (
    <div className="lottie-loader-container">
      <div className="lottie-animation-wrapper" style={{ width: size, height: size }}>
        {View}
      </div>
      {message && <p className="lottie-loader-message">{message}</p>}
    </div>
  );
};

export default LottieLoader;
