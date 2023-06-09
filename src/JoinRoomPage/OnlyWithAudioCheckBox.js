import React from 'react';
import CheckImg from '../resources/images/check.png';

const OnlyWithAudioCheckBox = ({ connectOnlyWithAudio, setConnectOnlyWithAudio }) => {
  const handleConnectionTypeChange = () => {
    setConnectOnlyWithAudio(!connectOnlyWithAudio);
  };

  return (
    <div className='checkbox_container'>
      <div
        className='checkbox_connection'
        onClick={handleConnectionTypeChange}>
        {connectOnlyWithAudio && (
          <img
            alt=''
            className='checkbox_image'
            src={CheckImg}></img>
        )}
      </div>
      <p className='checkbox_container_paragraph'>Audio only</p>
    </div>
  );
};

export default OnlyWithAudioCheckBox;
