import React from 'react';
import {useProduct} from '@shopify/hydrogen/client';
import ProductVideo from './ProductVideo.client';
import shirt_video_webm from '/YZY_GAP_BLACK_TEE_02.webm';

/**
 * A client component that defines a media gallery for hosting images, 3D models, and videos of products
 */
export default function Gallery() {
  // BOILERPLATE HYDROGEN
  const {media, selectedVariant} = useProduct();

  const featuredMedia = selectedVariant.image || media[0]?.image;
  const featuredMediaSrc = featuredMedia.url.split('?')[0];
  const galleryMedia = media.filter((med) => {
    if (
      med.mediaContentType === MODEL_3D_TYPE ||
      med.mediaContentType === VIDEO_TYPE
    ) {
      return true;
    }

    return !med.image.url.includes(featuredMediaSrc);
  });

  if (!media.length) {
    return null;
  }

  return (
    <div
      className="gap-4 flex overflow-x-scroll no-scrollbar scroll-snap-x scroll-smooth h-[485px] md:h-auto place-content-start"
      tabIndex="-1"
    >
      <ProductVideo 
        videoWebm={shirt_video_webm}  
      />
    </div>
  );
}

const MODEL_3D_TYPE = 'MODEL_3D';
const MODEL_3D_PROPS = {
  interactionPromptThreshold: '0',
};
const VIDEO_TYPE = 'VIDEO';