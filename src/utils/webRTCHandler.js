import { store } from '../store/store';
import { setMessages, setShowOverlay } from '../store/action';
import * as wss from './wss';
import Peer from 'simple-peer';
import { fetchTURNCredentials, getTurnIceServers } from './turn';

const defaultConstraints = { audio: true, video: { width: '480', height: '360' } };

const onlyAudioConstraints = { audio: true, video: false };

let localStream;

export const getLocalPreviewAndInitRoomConnection = async (
  isRoomHost,
  identity,
  roomId = null,
  onlyAudio
) => {
  //   await fetchTURNCredentials();

  const constraints = onlyAudio ? onlyAudioConstraints : defaultConstraints;

  navigator.mediaDevices
    .getUserMedia(constraints)
    .then((stream) => {
      console.log('SUCCESS get local-stream');
      localStream = stream;
      showLocalVideoPreview(localStream);

      store.dispatch(setShowOverlay(false)); // dispatch - hide overlay

      isRoomHost
        ? wss.createNewRoom(identity, onlyAudio)
        : wss.joinRoom(identity, roomId, onlyAudio);
    })
    .catch((err) => {
      console.log('error occurred when trying to get an access to local stream');
      console.log(err);
    });
};

// socketId - Peer
let peers = {};
let streams = [];

const getConfiguration = () => {
  const turnIceServers = getTurnIceServers();

  if (turnIceServers) {
    console.log('---TURN server credentials fetched');
    return { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, ...turnIceServers] };
  } else {
    console.log('---Using only STUN server');
    return { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
  }
};

const messengerChannel = 'messenger';

export const prepareNewPeerConnection = (connUserSocketId, isInitiator) => {
  const configuration = getConfiguration();

  peers[connUserSocketId] = new Peer({
    initiator: isInitiator,
    config: configuration,
    stream: localStream,
    channelName: messengerChannel,
  });

  peers[connUserSocketId].on('signal', (data) => {
    // webRTC offer, webRTC Answer (SDP information), ice candidate
    const signalData = { signal: data, connUserSocketId: connUserSocketId };

    wss.signalPeerData(signalData);
  });

  peers[connUserSocketId].on('stream', (stream) => {
    console.log('new stream came');
    addStream(stream, connUserSocketId);
    streams = [...streams, stream];
  });

  peers[connUserSocketId].on('data', (data) => {
    const messageData = JSON.parse(data);
    appendNewMessage(messageData);
  });
};

export const handleSignalingData = (data) => {
  // add signaling data to peer connection
  peers[data.connUserSocketId].signal(data.signal);
};

export const removePeerConnection = (data) => {
  const { socketId } = data;
  const videoContainer = document.getElementById(socketId);
  const videoElement = document.getElementById(`${socketId}-video`);

  if (videoContainer && videoElement) {
    const tracks = videoElement.srcObject.getTracks();
    tracks.forEach((t) => t.stop());

    videoElement.srcObject = null;
    videoContainer.removeChild(videoElement);

    videoContainer.parentNode.removeChild(videoContainer);

    if (peers[socketId]) {
      peers[socketId].destroy();
    }
    delete peers[socketId];
  }
};

///////////////////////////// UI Videos //////////////////////////
const showLocalVideoPreview = (stream) => {
  const videosContainer = document.getElementById('videos_portal');
  videosContainer.classList.add('videos_portal_styles');
  const videoContainer = document.createElement('div');
  videoContainer.classList.add('video_track_container');
  const videoElement = document.createElement('video');
  videoElement.autoplay = true;
  videoElement.muted = true;
  videoElement.srcObject = stream;

  videoElement.onloadedmetadata = () => {
    videoElement.play();
  };

  videoContainer.appendChild(videoElement);

  if (store.getState().connectOnlyWithAudio) {
    videoContainer.appendChild(getAudioOnlyLabel());
  }

  videosContainer.appendChild(videoContainer);
};

const addStream = (stream, connUserSocketId) => {
  // display incoming stream
  const videosContainer = document.getElementById('videos_portal');
  const videoContainer = document.createElement('div');
  videoContainer.id = connUserSocketId;

  videoContainer.classList.add('video_track_container');
  const videoElement = document.createElement('video');
  videoElement.autoplay = true;
  videoElement.srcObject = stream;
  videoElement.id = `${connUserSocketId}-video`;

  videoElement.onloadedmetadata = () => {
    videoElement.play();
  };

  videoElement.addEventListener('click', () => {
    if (videoElement.classList.contains('full_screen')) {
      videoElement.classList.remove('full_screen');
    } else {
      videoElement.classList.add('full_screen');
    }
  });

  videoContainer.appendChild(videoElement);

  // check if other user is only audio
  const participants = store.getState().participants;
  const participant = participants.find((p) => p.socketId === connUserSocketId);
  if (participant && participant.onlyAudio) {
    videoContainer.appendChild(getAudioOnlyLabel(participant.identity));
  } else {
    videoContainer.style.position = 'static';
  }

  videosContainer.appendChild(videoContainer);
};

const getAudioOnlyLabel = (identity = '') => {
  const labelContainer = document.createElement('div');
  labelContainer.classList.add('label_only_audio_container');

  const label = document.createElement('p');
  label.classList.add('label_only_audio_text');
  label.innerHTML = identity.length > 0 ? `Only audio - ${identity}` : 'Only audio';

  labelContainer.appendChild(label);
  return labelContainer;
};

///////////////////////////// Buttons logic //////////////////////////
export const toggleMic = (isMuted) => {
  localStream.getAudioTracks()[0].enabled = isMuted ? true : false;
};

export const toggleCamera = (isDisabled) => {
  localStream.getVideoTracks()[0].enabled = isDisabled ? true : false;
};

export const toggleScreenShare = (isScreenSharingActive, screenSharingStream = null) => {
  switchVideoTracks(isScreenSharingActive ? localStream : screenSharingStream);
};

export const switchVideoTracks = (stream) => {
  for (const socket_id in peers) {
    const orgPeer = peers[socket_id];
    const orgStream = orgPeer.streams[0];
    for (const i1 in orgStream.getTracks()) {
      const track1 = orgStream.getTracks()[i1];
      for (const i2 in stream.getTracks()) {
        const track2 = stream.getTracks()[i2];
        if (track1.kind === track2.kind) {
          orgPeer.replaceTrack(track1, track2, orgStream);
          break;
        }
      }
    }
  }
};

///////////////////////////// Messages //////////////////////////
const appendNewMessage = (messageData) => {
  const messages = store.getState().messages;
  store.dispatch(setMessages([...messages, messageData]));
};

export const sendMessageUsingDataChannel = (messageContent) => {
  // Append first
  const identity = store.getState().identity;
  const localMessageData = {
    content: messageContent,
    identity,
    messageCreatedByMe: true,
  };
  appendNewMessage(localMessageData);

  // Send
  const messageData = {
    content: messageContent,
    identity,
  };
  const stringifiedMessageData = JSON.stringify(messageData);

  for (const socketId in peers) {
    peers[socketId].send(stringifiedMessageData);
  }
};
