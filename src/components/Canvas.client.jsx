import {useRef, useEffect, Suspense} from 'react';
import * as THREE from 'three';
import {gsap} from 'gsap';

// TODO: autoplay first product video. currently, you have to first move the mouse to get it to play

export default function Carousel() {
  let prevPos = 0;
  let dragging = false;
  let circle = Math.PI * 2;
  let currAngle = {
    val: 0,
  };

  const videos = [
    {src: '/YZY_GAP_BLACK_TEE_02', stamp: 20},
    {src: '/YZY_GAP_BLACK_HOODIE', stamp: 10},
    {src: '/YZY_GAP_BLACK_PANTS_2_F_R', stamp: 12},
    {src: '/YZY_GAP_BLACK_ROUND_JACKET', stamp: 4},
    {src: '/YZY_GAP_BLACK_TEE_02', stamp: 9},
  ];

  const count = videos.length;
  const radius = 15;
  const angle = circle / count;
  const group = new THREE.Group();
  const wrapper = useRef(null);
  const canvasRef = useRef(null);
  let renderer = null;
  let camera = null;
  let raf = null;

  const scene = new THREE.Scene();

  function generatePosition() {
    let positions = [];
    for (let i = 0; i < count; i++) {
      positions.push(
        new THREE.Vector3(
          radius * Math.sin(circle),
          0,
          radius * Math.cos(circle),
        ),
      );
      circle -= angle;
    }
    return positions;
  }

  const makeVideo = (v, isSafari) => {
    const video = document.createElement('video');
    video.setAttribute('playsinline', true);
    video.setAttribute('controls', true);
    video.setAttribute('loop', true);
    const webm = document.createElement('source');
    webm.setAttribute('type', 'video/webm');
    webm.src = v.src + '.webm';
    const mov = document.createElement('source');
    mov.setAttribute('type', 'video/mp4; codecs="hvc1"');
    mov.src = v.src + '.mp4';
    // only append mov OR webm (according to browser)
    if (isSafari) {
      video.appendChild(mov);
    } else {
      video.appendChild(webm);
    }
    return video;
  };

  function geterateObjects(isSafari) {
    generatePosition().map((pos, i) => {
      const video = makeVideo(videos[i], isSafari);
      const geometry = new THREE.PlaneGeometry(48 / 24, 30 / 15);
      const videoPlane = new THREE.Mesh(
        geometry,
        new THREE.MeshBasicMaterial({
          map: new THREE.VideoTexture(video),
          transparent: true,
        }),
      );

      videoPlane.position.copy(pos);
      videoPlane.userData.video = video;

      // lazy load hack
      // automatically show the first on the carousel (which are the last on the list)
      if (i < 4) {
        videoPlane.userData.startTime = videos[i].stamp;
      } else {
        // display as soon as threejs window loads
        videoPlane.userData.startTime = 0;
      }
      circle -= angle;
      group.add(videoPlane);
    });
  }

  // help make the carousel window responsive
  function onWindowResize() {
    camera.aspect = wrapper.current.clientWidth / wrapper.current.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(wrapper.current.clientWidth, wrapper.current.clientHeight);
    render();
  }

  useEffect(() => {
    camera = new THREE.PerspectiveCamera(
      75,
      wrapper.current.clientWidth / wrapper.current.clientHeight,
      0.4,
      100,
    );
    camera.position.x = radius;
    // use alpha: true to set background transparent
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: canvasRef.current,
      alpha: true,
    });
    renderer.setSize(wrapper.current.clientWidth, wrapper.current.clientHeight);

    // check for Safari 3.0+
    const isSafari =
      /constructor/i.test(window.HTMLElement) ||
      (function (p) {
        return p.toString() === '[object SafariRemoteNotification]';
      })(
        !window['safari'] ||
          (typeof safari !== 'undefined' && safari.pushNotification),
      );

    geterateObjects(isSafari);
    scene.add(group);

    // do not set background to white, leaving here for ref
    // scene.background = new THREE.Color(0xffffff);
    window.addEventListener('mousedown', activateVideo, {'once': true});

    // make three.js window responsive when user changes window size
    window.addEventListener('resize', onWindowResize, false);
    render();
  });

  useEffect(()=> {
    group.children.forEach(el => {
      el.userData.video.addEventListener('loadedmetadata', VideoMetaDataLoaded);

      function VideoMetaDataLoaded() {
        el.userData.video.currentTime = el.userData.startTime;
        setTimeout(()=>{render()},500)
      }
    })
  })


  const playVideo = () => {
    raf = window.requestAnimationFrame(playVideo);
    renderer.render(scene, camera);
  }

  const render = () => {
    group.children.forEach(child => {
      child.lookAt(child.getWorldPosition(new THREE.Vector3()).x, 0, 10)
    })
    renderer.render(scene, camera);
  }

  
  const rotate = (val) => {
   window.cancelAnimationFrame(raf);
    gsap.to(currAngle, {
      val: '+=' + val * 0.05, //speed of carousel rotation
      onUpdate: () => {
        group.rotation.y = currAngle.val;
        render();
      },
      onComplete: () => {
        group.children.forEach(el => {
          // lazy load hack
          // only rotate/play the active product
          if(el.getWorldPosition(new THREE.Vector3()).x > 12 && el.getWorldPosition(new THREE.Vector3()).z < 2) {
            el.userData.video.play();
            playVideo();
          } else {
            // pause the products in the background
            // HUGE performance boost, carousel is not usuable if we dont do this
            el.userData.video.pause();
          }
        })
      }
    });
  };

  const activateVideo = () => {
    group.children.forEach(el => {
      el.userData.video.play();
      el.userData.video.pause();
    })
  }

  const onTouchStart = (e) => {
    dragging = true;
    prevPos = e.clientX || e.touches[0].clientX;
  };

  const calcPosition = (e) => {
    if (!dragging) return;
    let clientX = e.clientX ? e.clientX : e.touches[0].clientX;
    if (clientX === prevPos) return;
    clientX > prevPos ? rotate(1) : rotate(-1);
    prevPos = clientX;
  };

  

  return (
    <div
      ref={wrapper}
      style={{
        height: 100 + '%',
        width: 100 + '%'
      }}
    >
      <canvas
      ref={canvasRef}
      onMouseDown={(e) => onTouchStart(e)}
      onMouseUp={(e) => (dragging = false)}
      onMouseMove={(e) => calcPosition(e)}
      onTouchStart={(e) => onTouchStart(e)}
      onTouchEnd={(e) => (dragging = false)}
      onTouchMove={(e) => calcPosition(e)}
      ></canvas>
    </div>
  
  );
}
