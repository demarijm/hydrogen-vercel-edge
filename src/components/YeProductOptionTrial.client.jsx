import {useProduct} from '@shopify/hydrogen/client';
import {useEffect, useState} from 'react';

/**
 * A client component that tracks a selected variant and/or selling plan state, as well as callbacks for modifying the state
 */
export default function YeProductOptionTrial() {
  const {options, setSelectedOption} = useProduct();
  let [index, setIndex] = useState(0);

  return (
    <>
      {options.map(({name, values}) => {

        const amountOfValues = values.length - 1;
        const id = `option-${name}-${values[index]}`;
        console.log(values[index]);

        function decrementOption() {
          if (index != 0) {
            setIndex(--index);
          } else {
            setIndex(amountOfValues);
          }
        }

        function incrementOption() {
          if (index < amountOfValues) {
            setIndex(++index);
          } else {
            setIndex(0);
          }
        }

        useEffect(() => {
          setSelectedOption(name, values[index]);
        }, [index])
        return (
          <fieldset key={id} className="mt-8">
            <div className="flex justify-center items-center flex-wrap gap-4">
              <button className={`p-3 m-3`} onClick={decrementOption}>
                {
                  <svg
                    width="39"
                    height="54"
                    viewBox="0 0 78 109"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="animate-pulse"
                  >
                    <path
                      d="M3.01311 54.4138C-0.396256 52.025 -0.396263 46.975 3.0131 44.5861L63.807 1.98979C67.7834 -0.796357 73.25 2.04827 73.25 6.90364V92.0963C73.25 96.9517 67.7835 99.7963 63.807 97.0102L3.01311 54.4138Z"
                      fill="#FFFED7"
                    />
                  </svg>
                }
              </button>
              <label key={id} htmlFor={id} className="flex justify-between">
                <p className="text-[#FFFED7] text-9xl">{values[index]}</p>
              </label>
              <button className={`p-3 m-3`} onClick={incrementOption}>
                {
                  <svg
                    width="39"
                    className="animate-pulse"
                    height="54"
                    viewBox="0 0 78 109"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M70.9869 44.5861C74.3963 46.975 74.3963 52.025 70.9869 54.4138L10.193 97.0102C6.21657 99.7963 0.750005 96.9517 0.750005 92.0963L0.750005 6.90364C0.750005 2.04828 6.21656 -0.796363 10.193 1.98979L70.9869 44.5861Z"
                      fill="#FFFED7"
                    />
                  </svg>
                }
              </button>
            </div>
          </fieldset>
        );
      })}
    </>
  );
}
