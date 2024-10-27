import React, { useRef, useEffect } from 'react';

const VideoPreview: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.controls = false;
    }
  }, []);

  return (
    <div
      style={{
        borderWidth: '1px',
        borderColor: 'rgba(34, 34, 34, 0.1)',
        borderStyle: 'solid',
        backgroundColor: 'rgba(0, 0, 0, 0)',
        maxWidth: '100%',
        width: '100%',
        borderRadius: '12px',
        boxShadow: 'rgba(10, 0, 31, 0.05) 0px 1px 16px 3px',
        opacity: 1,
        overflow: 'hidden', // Added to ensure border radius is visible
      }}
    >
      <video 
        ref={videoRef}
        width="100%" 
        height="auto" 
        autoPlay 
        muted 
        loop 
        playsInline
        style={{ display: 'block' }} // Ensures no extra space below video
      >
        <source src="/preview5.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPreview;
