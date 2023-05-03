import React from 'react';
import MicButton from './MicButton';
import CameraButton from './CameraButton';
import LeaveButton from './LeaveButton';
import SwitchToScreenSharingButton from './SwitchToScreenSharingButton';
import { connect } from 'react-redux';

const VideoButtons = (props) => {
  const { connectOnlyWithAudio } = props;

  return (
    <div className='video_buttons_container'>
      <MicButton />
      {!connectOnlyWithAudio && <CameraButton />}
      <LeaveButton />
      {!connectOnlyWithAudio && <SwitchToScreenSharingButton />}
    </div>
  );
};

const mapStoreStateToProps = (state) => {
  return { ...state };
};

export default connect(mapStoreStateToProps)(VideoButtons);
