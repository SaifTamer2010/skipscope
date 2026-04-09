import Image from "next/image";
import MainButton from "../buttons/MainButton";

const PackagesContainer = ({
  src,
  alt,
  title,
  description,
  poweredByActive = false,
  poweredBy,
  recordsShow,
  records,
}: {
  src: string;
  alt: string;
  title: string;
  description: string;
  poweredByActive?: boolean;
  poweredBy?: string;
  recordsShow?: boolean;
  records?: string;
}) => {
  return (
    <div className="relative w-60 h-130 rounded-xl bg-background-secondry grid grid-rows-[50px_50px_70px_240px_50px] p-6 transition-all shadow-lg shadow-black hover:scale-105 overflow-hidden border border-border-muted">
      {poweredByActive && (
        <div className="absolute -right-6 top-8 rotate-45 bg-brand-primary-strong px-10 py-1 text-xs font-bold text-text-primary shadow-md ">
          {poweredBy}
        </div>
      )}
      <div className="w-8 h-8 rounded-sm bg-background-third shadow-black shadow-2xl hover:scale-125 transition-all ">
        <Image src={src} alt={alt} width={80} height={80} />
      </div>
      <h1 className="text-xl font-semibold text-text-primary ">{title}</h1>
      <div className="bg-brand-primary-dark w-35 h-10 rounded-2xl text-xs justify-center items-center flex text-text-primary font-bold text-center shadow-2xs shadow-black border-border-light border">
        {records}
      </div>
      <p className="text-sm text-text-secondry">{description}</p>
      <footer className="flex justify-center items-center">
        <MainButton Goto="/app/auth/login">Get Started</MainButton>
      </footer>
    </div>
  );
};

export default PackagesContainer;
