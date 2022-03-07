import {
  flattenConnection,
  useProduct,
  useParsedMetafields,
  ProductProvider,
  BuyNowButton,
} from '@shopify/hydrogen/client';

import earth from '/globe.webm';
import emptyPill from '/YZY_PILL_BLANK.webm';
import pill from '/YZY_PILL.webm';

import Gallery from './Gallery.client';

import {Fragment, useRef, useState} from 'react';
import YeProductOptionTrial from './YeProductOptionTrial.client';
import {motion} from 'framer-motion';
import {Dialog, Transition} from '@headlessui/react';

// TODO: handle case of when pill and globe move behind the product video
// IDEA: - consider restricting drag motion into that area? ^


function YeModal() {
  // State for modal
  let [isOpen, setIsOpen] = useState(false);
  // State for pill
  let [isBlank, setIsBlank] = useState(true);

  // Modal -- functionality
  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  // Pill -- Loading
  function loadProductPill() {
    setIsBlank(!isBlank);
  }

  const {selectedVariant} = useProduct();
  const isOutOfStock = !selectedVariant.availableForSale;
  let variantSize = selectedVariant.title;

  // Framer -- size variations
  const variants = {
    // TODO: set the small scale to 1.0 - I have set it to 1.001 bc if I don't the variant selector doesnt work
    small: {scale: 1.001},
    medium: {scale: 1.2},
    large: {scale: 1.4},
    extraLarge: {scale: 1.6},
    doubleExtraLarge: {scale: 1.8},
  };
  function getAnimationVariant() {
    if (variantSize === 'S') {
      return 'small';
    } else if (variantSize === 'M') {
      return 'medium';
    } else if (variantSize === 'L') {
      return 'large';
    } else if (variantSize === 'XL') {
      return 'extraLarge';
    } else if (variantSize === 'XXL') {
      return 'doubleExtraLarge';
    }
  }

  // Framer -- drag constraints
  const constraintsRef = useRef(null);

  return (
    <>
    {/* Pill on the side of the product  */}
      <motion.div
        ref={constraintsRef}
        className="h-screensm:flex-col sm:items-center lg:flex lg:flex-row md:flex-col"
      >
        {/* Objects surrounding product */}
        <button
          onClick={loadProductPill}
          className="h-auto cursor-pointer w-[25%] z-[2]"
        >
          <motion.div
            drag={true}
            dragConstraints={constraintsRef}
            whileHover={{scale: 1.3}}
            whileTap={{scale: 1.3}}
          >
            <video
              autoPlay
              loop
              className="cursor-grab  sm:py-0 active:cursor-grabbing py-11"
              src={isBlank ? emptyPill : pill}
            />
          </motion.div>
        </button>
        <motion.div animate={getAnimationVariant} variants={variants}>
          <button onClick={openModal}>
            {/* Product in the center  */}
            <Gallery />
            {/* Earth on the side of the product  */}
          </button>
        </motion.div>

        <motion.div
          drag={true}
          dragConstraints={constraintsRef}
          whileHover={{scale: 1.3}}
          whileTap={{scale: 1.3}}
        >
          <video
            autoPlay
            loop
            className="py-11 sm:py-0 active:cursor-grabbing cursor-grab"
            src={earth}
          />
        </motion.div>
      </motion.div>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-hidden"
          onClose={closeModal}
        >
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 backdrop-blur-sm" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="inline-block w-full h-96 max-w-md my-8 overflow-hidden text-center align-middle bg-opacity-30 transition-all transform ">
                <Dialog.Title
                  as="h3"
                  className=" font-medium text-9xl text-gray-900"
                >
                  <YeProductOptionTrial />
                  <div className="space-y-2 mb-8">
                    {isOutOfStock ? (
                      <p className="text-black text-sm text-center">
                        Not Availible
                      </p>
                    ) : (
                      <BuyNowButton className="border border-white bg-white text-sm p-3">
                        Buy now
                      </BuyNowButton>
                    )}
                  </div>
                </Dialog.Title>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}


export default function ProductDetails({product}) {
  const initialVariant = flattenConnection(product.variants)[0];

  const productMetafields = useParsedMetafields(product.metafields);
  const sizeChartMetafield = productMetafields.find(
    (metafield) =>
      metafield.namespace === 'my_fields' && metafield.key === 'size_chart',
  );
  const sustainableMetafield = productMetafields.find(
    (metafield) =>
      metafield.namespace === 'my_fields' && metafield.key === 'sustainable',
  );
  const lifetimeWarrantyMetafield = productMetafields.find(
    (metafield) =>
      metafield.namespace === 'my_fields' &&
      metafield.key === 'lifetime_warranty',
  );

  return (
    <>
      <ProductProvider data={product} initialVariantId={initialVariant.id}>
        <div className="flex justify-center items-center">
          <div className="flex justify-center items-center h-screen">
            <YeModal />
          </div>
        </div>
      </ProductProvider>
    </>
  );
}
