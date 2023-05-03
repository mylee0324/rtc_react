import React, { useEffect, useRef } from 'react';

const SingleMessage = ({ isAuthor, messageContent }) => {
  const messageStyle = isAuthor ? 'author_direct_message' : 'receiver_direct_message';
  const containerStyle = isAuthor
    ? 'direct_message_container_author'
    : 'direct_message_container_receiver';

  return (
    <div className={containerStyle}>
      <p className={messageStyle}>{messageContent}</p>
    </div>
  );
};

const MessagesContainer = ({ messages }) => {
  const scrollRef = useRef();

  useEffect(() => {
    if (scrollRef) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className='direct_messages_container'>
      {messages.map((message) => {
        return (
          <SingleMessage
            messageContent={message.messageContent}
            identity={message.identity}
            isAuthor={message.isAuthor}
            key={`${message.messageContent}-${message.identity}`}></SingleMessage>
        );
      })}
      <div ref={scrollRef}></div>
    </div>
  );
};

export default MessagesContainer;
