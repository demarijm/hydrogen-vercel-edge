import React, { useReducer, useRef, useEffect, useLayoutEffect } from 'react';
import { isClient } from '@shopify/hydrogen/client';

function productVideoReducer(state, action) {
  switch (action.type) {
    // Play forward
    case 'PLAY_FORWARD': {
      return { ...state, start: action.start, stop: action.stop, isReversed: false}
    }
    // Play reverse
    case 'PLAY_REVERSE': {
      return { ...state, start: action.start, stop: action.stop, isReversed: true }
    }
    // Sets the playback rate of the video
    case 'PLAYBACK_RATE': {
      return { ...state, playbackRate: action.playbackRate }
    }
    // Set video length and midpoint
    case 'SET_LENGTH': {
      const midPoint = action.videoLength / 2;
      return { ...state, videoLength: action.videoLength, midPoint: midPoint }
    }
    // Is True once the video file has been loaded to the page
    case 'LOADED': {
      return { ...state, isLoaded: true }
    }
    // Initializes the mouse position when a user clicks on the video
    case 'MOUSE_CLICK': {
      return {...state, 
        mouseDown: action.mouseDown, 
        mouseX: action.mouseX, 
        playbackRate: action.playbackRate || 1 
      }
    }
    // Tracks when the user is moving the mouse when clicking on the video
    case 'MOUSE_MOVING': {
      return { ...state, mouseMoving: action.mouseMoving }
    }
    case 'MOUSE_X': {
      return { ...state, mouseX: action.mouseX }
    }
    default:
      return state;
  }
}

export default function ProductVideo({videoWebm, videoMP4}) {
    // VIDEO REDUCER STATE
    const [productVideo, dispatchVideo] = useReducer(productVideoReducer, {
      videoLength: 0,
      midPoint: 0,
      isReversed: false,
      start: 0,
      stop: 0,
      playbackRate: 1,
      isLoaded: false,
      mouseDown: false,
      mouseX: 0,
      mouseMoving: false
    })

  // Refs
  const videoRef = useRef();
  const timerRef = useRef(0);
  const animationRef = useRef(0);
  const reversedRef = useRef(false);
  const midpointRef = useRef(false);
  const startRef = useRef(false);
  const videoPlayRef = useRef('');

  // Ref updates needed for useAnimationFrame to execute with the correct state
  useEffect(() => {
    reversedRef.current = productVideo.isReversed;
    midpointRef.current = productVideo.midPoint;
    startRef.current = productVideo.start;
  }, [productVideo.isLoaded, productVideo.isReversed, productVideo.start]);

  // All play/pause requests made to the video are made in this useEffect
  useEffect(() => {
    if (videoPlayRef.current === 'play') {
      videoRef.current.play();
    }
    if (videoPlayRef.current === 'pause') {
      videoRef.current.pause();
    }
  }, [videoPlayRef.current]);

  // Recursive function needed for requestAnimationFrame to execute
  const animateVideo = () => {
    animationRef.current = requestAnimationFrame(animateVideo);
    if (!reversedRef.current && videoRef.current.currentTime >= midpointRef.current) {
      videoRef.current.currentTime = startRef.current;
    }
    if (reversedRef.current && videoRef.current.currentTime < midpointRef.current) {
      videoRef.current.currentTime = startRef.current;
    }
  }

  // useEffect for requestAnimationFrame
  useEffect(() => {
    animationRef.current = requestAnimationFrame(animateVideo);
    return () => cancelAnimationFrame(animationRef.current)
  }, [animationRef]);


  // Get video properties after video load
  useEffect(() => {
    dispatchVideo({type: 'SET_LENGTH', videoLength: videoRef.current.duration})
    dispatchVideo({ type: 'PLAY_FORWARD', start: 0, stop: videoRef.current.duration / 2 })
  }, [productVideo.isLoaded]);

  // Update playback rate
  useEffect(() => {
    videoRef.current.playbackRate = productVideo.playbackRate
  }, [productVideo.playbackRate]);

  // Event Listener to set the state of productVideo.isLoaded to true once the video is able to be played
  if (isClient()) {
    useLayoutEffect(() => {
      videoRef.current.addEventListener('canplay', handleCanPlay);
      return () => videoRef.current.removeEventListener('canplay', handleCanPlay);
    }, [videoRef]);
  }

  // Callback function for useLayoutEffect 'canplay'
  const handleCanPlay = () => {
    dispatchVideo({ type: 'LOADED', isLoaded: true })
  }

  // MOUSE EVENTS
  const handleMouseDown = (e) => {
    dispatchVideo({type: 'MOUSE_CLICK', mouseDown: true, mouseX: e.clientX })
    videoPlayRef.current = 'pause';
  }

  const handleMouseUp = () => {
    clearInterval(timerRef.current);
    dispatchVideo({type: 'MOUSE_CLICK', mouseDown: false, mouseX: 0, playbackRate: 1})
    videoPlayRef.current = 'play';
  }

  const handleMouseLeave = () => {
    clearInterval(timerRef.current);
    dispatchVideo({type: 'MOUSE_CLICK', mouseDown: false, mouseX: 0, playbackRate: 1})
    videoPlayRef.current = 'play';
  }

  // Needed to properly handle the playback of the video when holding down the mouse and moving it
  useEffect(() => {
    if (productVideo.mouseMoving) {
      videoPlayRef.current = 'play';
    }
    if (productVideo.isLoaded && !productVideo.mouseMoving) {
      videoPlayRef.current = 'pause';
    }
  }, [productVideo.mouseMoving])

  const handleMouseMove= (e) => {
    if (productVideo.mouseDown) {
      if (!productVideo.mouseMoving) {
        dispatchVideo({ type: 'MOUSE_MOVING', mouseMoving: true })
      }
      // Timer for tracking when mouse movement stops over the video
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        dispatchVideo({ type: 'MOUSE_MOVING', mouseMoving: false })
        dispatchVideo({ type: 'MOUSE_X', mouseX: e.clientX })
      }, 100)
      // MOUSE TO THE LEFT OF ORIGIN
      if (productVideo.mouseDown && e.clientX < productVideo.mouseX) {
        if (productVideo.isReversed) {
          // This temporary time is needed so requestAnimationFrame doesn't 
          // start the video at 0 when alternating between forward/reverse
          const tempTime = (productVideo.videoLength - videoRef.current.currentTime);
          dispatchVideo({ type: 'PLAY_FORWARD', start: tempTime, stop: productVideo.midPoint })
          // This sets the state back to where it's needed for requestAnimationFrame to loop the correct section
          setTimeout(() => {
            dispatchVideo({ type: 'PLAY_FORWARD', start: 0, stop: productVideo.midPoint })
          }, 20);
        }
        let speed = Math.ceil((e.clientX - productVideo.mouseX) / 15);
        speed < -8 ? speed = 8 : speed = speed * -1;
        if (speed !== productVideo.playbackRate) {
          dispatchVideo({ type: 'PLAYBACK_RATE', playbackRate: speed })
        }
        videoPlayRef.current = 'play';
      }
      // MOUSE TO THE RIGHT OF ORIGIN
      if (productVideo.mouseDown && e.clientX > productVideo.mouseX) {
        if (!productVideo.isReversed) {
          // This temporary time is needed so requestAnimationFrame doesn't 
          // start the video at 0 when alternating between forward/reverse
          const tempTime = (productVideo.videoLength - videoRef.current.currentTime);
          dispatchVideo({ type: 'PLAY_REVERSE', start: tempTime, stop: productVideo.videoLength })
          // This sets the state back to where it's needed for requestAnimationFrame to loop the correct section
          setTimeout(() => {
            dispatchVideo({ type: 'PLAY_REVERSE', start: productVideo.midPoint, stop: productVideo.videoLength })
          }, 20);
        }
        let speed = Math.ceil((e.clientX - productVideo.mouseX) / 15);
        speed > 8 ? speed = 8 : speed = speed;
        if (speed !== productVideo.playbackRate) {
          dispatchVideo({ type: 'PLAYBACK_RATE', playbackRate: speed })
        }
        videoPlayRef.current = 'play';
      }
    }
  }

  // TOUCH EVENTS
  const handleTouchStart = (e) => {
    dispatchVideo({type: 'MOUSE_CLICK', mouseDown: true, mouseX: e.touches[0].clientX })
    videoPlayRef.current = 'pause';
  }

  const handleTouchEnd = () => {
    clearInterval(timerRef.current);
    dispatchVideo({type: 'MOUSE_CLICK', mouseDown: false, mouseX: 0, playbackRate: 1})
    videoPlayRef.current = 'play';
  }

  const handleTouchMove= (e) => {
    const touchX = e.touches[0].clientX;
    if (productVideo.mouseDown) {
      if (!productVideo.mouseMoving) {
        dispatchVideo({ type: 'MOUSE_MOVING', mouseMoving: true })
      }
      // Timer for tracking when touch movement stops over the video
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        dispatchVideo({ type: 'MOUSE_MOVING', mouseMoving: false })
        dispatchVideo({ type: 'MOUSE_X', mouseX: touchX })
      }, 100)
      // TOUCH TO THE LEFT OF ORIGIN
      if (productVideo.mouseDown && touchX < productVideo.mouseX) {
        if (productVideo.isReversed) {
          // This temporary time is needed so requestAnimationFrame doesn't 
          // start the video at 0 when alternating between forward/reverse
          const tempTime = (productVideo.videoLength - videoRef.current.currentTime);
          dispatchVideo({ type: 'PLAY_FORWARD', start: tempTime, stop: productVideo.midPoint })
          // This sets the state back to where it's needed for requestAnimationFrame to loop the correct section
          setTimeout(() => {
            dispatchVideo({ type: 'PLAY_FORWARD', start: 0, stop: productVideo.midPoint })
          }, 50);
        }
        let speed = Math.ceil((touchX - productVideo.mouseX) / 15);
        speed < -8 ? speed = 8 : speed = speed * -1;
        if (speed !== productVideo.playbackRate) {
          dispatchVideo({ type: 'PLAYBACK_RATE', playbackRate: speed })
        }
        videoPlayRef.current = 'play';
      }
      // TOUCH TO THE RIGHT OF ORIGIN
      if (productVideo.mouseDown && touchX > productVideo.mouseX) {
        if (!productVideo.isReversed) {
          // This temporary time is needed so requestAnimationFrame doesn't 
          // start the video at 0 when alternating between forward/reverse
          const tempTime = (productVideo.videoLength - videoRef.current.currentTime);
          dispatchVideo({ type: 'PLAY_REVERSE', start: tempTime, stop: productVideo.videoLength })
          // This sets the state back to where it's needed for requestAnimationFrame to loop the correct section
          setTimeout(() => {
            dispatchVideo({ type: 'PLAY_REVERSE', start: productVideo.midPoint, stop: productVideo.videoLength })
          }, 50);
        }
        let speed = Math.ceil((touchX - productVideo.mouseX) / 15);
        speed > 8 ? speed = 8 : speed = speed;
        if (speed !== productVideo.playbackRate) {
          dispatchVideo({ type: 'PLAYBACK_RATE', playbackRate: speed })
        }
        videoPlayRef.current = 'play';
      }
    }
  }

  return (
    <div 
      className="w-full h-full cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={(e) => handleMouseMove(e)}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={(e) => handleTouchMove(e)}
    >
      <video 
        className="w-full" 
        ref={videoRef} 
        loop
        autoPlay={true}
        playsInline={true}
        muted={true}
      >
        <source src={videoWebm} type="video/webm" />
        <source src={videoMP4} type="video/mp4" />
      </video>
    </div>
  )
}