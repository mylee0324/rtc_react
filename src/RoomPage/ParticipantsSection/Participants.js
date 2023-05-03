import React from 'react';
import { connect } from 'react-redux';
import { setActiveConversation } from '../../store/action';

const SingleParticipant = (props) => {
  const { identity, lastItem, participant, setActiveConversationAction, socketId } =
    props;

  const handleOpenActiveChatBox = () => {
    if (participant.socketId !== socketId) {
      setActiveConversationAction(participant);
    } else {
      setActiveConversationAction(null);
    }
  };
  return (
    <>
      <p
        className='participants_paragraph'
        onClick={handleOpenActiveChatBox}>
        {identity}
      </p>
      {!lastItem && <span className='participants_separator_line'></span>}
    </>
  );
};

const Participants = ({ participants, setActiveConversationAction, socketId }) => {
  return (
    <div className='participants_container'>
      {participants.map((p, index) => {
        return (
          <SingleParticipant
            key={p.identity}
            lastItem={participants.length === index + 1}
            participant={p}
            identity={p.identity}
            setActiveConversationAction={setActiveConversationAction}
            socketId={socketId}
          />
        );
      })}
    </div>
  );
};

const mapStoreStateToProps = (state) => {
  return { ...state };
};

const actionToProps = (dispatch) => {
  return {
    setActiveConversationAction: (activeConversation) => {
      dispatch(setActiveConversation(activeConversation));
    },
  };
};

export default connect(mapStoreStateToProps, actionToProps)(Participants);
