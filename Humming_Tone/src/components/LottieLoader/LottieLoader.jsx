import React from 'react';
import * as LottieModule from 'lottie-react';
import loadingAnimation from '../../animation/loading.json';
import './LottieLoader.css';

const Lottie = LottieModule.default || LottieModule.Lottie || LottieModule;

export const LottieLoader = ({ size = 160, message = '' }) => {
  return (
    <div className="lottie-loader-container">
      <div className="lottie-animation-wrapper" style={{ width: size, height: size }}>
        <Lottie
          animationData={loadingAnimation}
          loop={true}
          autoplay={true}
        />
      </div>
      {message && <p className="lottie-loader-message">{message}</p>}
    </div>
  );
};

export default LottieLoader;
