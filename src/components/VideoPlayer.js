import React, { useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';

const VideoPlayer = ({ videoUrl, snippets, currentTimeRange, onTimeUpdate, selectedSnippet }) => {
  const playerRef = useRef(null);

  useEffect(() => {
    if (playerRef.current && currentTimeRange) {
      playerRef.current.seekTo(convertToSeconds(currentTimeRange.start_time));
    }
  }, [currentTimeRange]);

  const handleProgress = (state) => {
    onTimeUpdate(state.playedSeconds);
  };

  const convertToSeconds = (timeString) => {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  };

  const renderTimeRangeMarkers = () => {
    const duration = playerRef.current ? playerRef.current.getDuration() : 0;
    return snippets.map((snippet, index) => {
      const startPercent = (convertToSeconds(snippet.time_stamp.start_time) / duration) * 100;
      const endPercent = (convertToSeconds(snippet.time_stamp.end_time) / duration) * 100;
      const width = endPercent - startPercent;
      return (
        <div
          key={index}
          style={{
            position: 'absolute',
            left: `${startPercent}%`,
            width: `${width}%`,
            height: '100%',
            backgroundColor: selectedSnippet === snippet ? '#A65D3A' : '#9c9895',
            opacity: 0.7,
          }}
        />
      );
    });
  };

  return (
    <div style={{ position: 'relative' }}>
      <ReactPlayer
        ref={playerRef}
        url={videoUrl}
        controls={true}
        width="100%"
        height="auto"
        onProgress={handleProgress}
      />
      <div style={{ position: 'relative', height: '10px', backgroundColor: '#ebe3dd', marginTop: '5px' }}>
        {renderTimeRangeMarkers()}
      </div>
    </div>
  );
};

export default VideoPlayer;