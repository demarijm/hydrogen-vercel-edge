import {Image, Link} from '@shopify/hydrogen';

/**
 * A shared component that displays a single product to allow buyers to quickly identify a particular item of interest
 */
export default function ProductCard({product}) {
  const selectedVariant = product.variants.edges[0].node;

  if (selectedVariant == null) {
    return null;
  }

  return (
    <div className=" text-md text-center mb-4 relative">
      <Link to={`/products/${product.handle}`}>
        <div className="mb-2 relative flex items-center justify-center overflow-hidden object-cover h-96">
          {selectedVariant.image ? (
            <Image
              className="absolute w-full h-full transition-all duration-500 ease-in-out transform bg-center bg-cover object-center object-contain hover:scale-110"
              data={selectedVariant.image}
            />
          ) : null}
          {!selectedVariant?.availableForSale && (
            <div className="absolute text-center top-3 left-3 rounded-3xl text-xs bg-black text-white py-3 px-4">
              Out of stock
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}
