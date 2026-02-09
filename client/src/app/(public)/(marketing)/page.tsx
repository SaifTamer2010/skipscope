import MainButton from "@/src/components/buttons/MainButton";

const page = () => {
  return (
    <div>
      <div className="flex items-center justify-center flex-col h-[calc(100vh-250px)] ">
        <h1 className="text-text-primary text-3xl sm:text-4xl font-bold text-center w-100 sm:w-125">
          Reach the Right People Every Time
        </h1>
        <p className="text-text-secondry text-xs sm:text-md font-semibold text-center w-80 sm:w-125 mt-4 tracking-wide ">
          More than just a skip-tracing service — we’re your partner in finding
          the right audience, building smarter campaigns, and driving better
          ROI.
        </p>
        <div className="mt-20 flex justify-center flex-col items-center gap-4">
          <MainButton Goto={"/app/auth/login"}>
            <p className="sm:text-md font-semibold text-shadow-2xs text-shadow-black">
              Start Building
            </p>
          </MainButton>
          <p className="text-text-secondry text-xs cursor-pointer">
            Request a demo
          </p>
        </div>
      </div>
    </div>
  );
};

export default page;
