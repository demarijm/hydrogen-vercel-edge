/**
 * A shared component and Suspense call that's used in `App.server.jsx` to let your app wait for code to load while declaring a loading state
 */
export default function LoadingFallback() {
  return (
    <header className="h-screen max-w-screen text-gray-700">
      <div className="fixed z-10 lg:h-32 w-full bg-white/90 border-b border-black border-opacity-5 px-6 md:px-8 md:py-6 lg:pt-8 lg:pb-0 mx-auto">
        <div className="h-full flex lg:flex-col place-content-between">
          <div className="text-center w-full flex justify-between items-center">
            <div className="lg:block w-16" />
            <p className="font-black uppercase text-3xl tracking-widest">
              Yzy Supply
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
