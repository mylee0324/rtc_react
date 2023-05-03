import React, { useState } from 'react';
import SwitchImg from '../../resources/images/switchToScreenSharing.svg';
import LocalScreenSharingPreview from './LocalScreenSharingPreview';
import * as webRTCHandler from '../../utils/webRTCHandler';

const constraints = {
  audio: false,
  video: true,
};

const SwitchToScreenSharingButton = () => {
  const [isScreenSharingActive, setIsScreenSharingActive] = useState(false);
  const [screenSharingStream, setScreenSharingStream] = useState(null);

  const handleScreenSharing = async () => {
    if (!isScreenSharingActive) {
      let stream = null;
      try {
        stream = await navigator.mediaDevices.getDisplayMedia(constraints);
      } catch (err) {
        console.log('error occurred - screen share stream');
      }
      if (stream) {
        // set stream
        setScreenSharingStream(stream);

        // execute and set
        webRTCHandler.toggleScreenShare(isScreenSharingActive, stream);
        setIsScreenSharingActive(true);
      }
    } else {
      // execute and set
      webRTCHandler.toggleScreenShare(isScreenSharingActive, null);
      setIsScreenSharingActive(false);

      // stop stream
      screenSharingStream.getTracks().forEach((t) => t.stop());
      setScreenSharingStream(null);
    }
  };

  return (
    <>
      <div className='video_button_container'>
        <img
          alt=''
          src={SwitchImg}
          onClick={handleScreenSharing}
          className='video_button_image'
        />
      </div>
      {isScreenSharingActive && (
        <LocalScreenSharingPreview stream={screenSharingStream} />
      )}
    </>
  );
};

export default SwitchToScreenSharingButton;
