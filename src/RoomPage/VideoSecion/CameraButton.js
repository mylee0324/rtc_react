import React, { useState } from 'react';
import CameraButtonImg from '../../resources/images/camera.svg';
import CameraButtonImgOff from '../../resources/images/cameraOff.svg';
import * as webRTCHandler from '../../utils/webRTCHandler';

const CameraButton = () => {
  const [isLocalVideoDiabled, setIsLocalVideoDisabled] = useState(false);

  const handleCameraButtonPressed = () => {
    webRTCHandler.toggleCamera(isLocalVideoDiabled);
    setIsLocalVideoDisabled(!isLocalVideoDiabled);
  };

  return (
    <div className='video_button_container'>
      <img
        alt=''
        src={isLocalVideoDiabled ? CameraButtonImgOff : CameraButtonImg}
        className='video_button_image'
        onClick={handleCameraButtonPressed}
      />
    </div>
  );
};

export default CameraButton;
