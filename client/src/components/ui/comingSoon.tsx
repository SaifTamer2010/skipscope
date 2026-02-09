import Image from "next/image";

const comingSoon = () => {
  return (
    <div className="w-80 h-50 rounded-xl bg-background-secondry flex justify-center items-center">
      <div className="text-xl font-semibold text-white shadow-md text-center space-x-1 animate-pulse">
        Coming Soon
      </div>
    </div>
  );
};

export default comingSoon;
