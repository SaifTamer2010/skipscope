import Image from "next/image";

const industriesContainer = ({
  src,
  alt,
  title,
  description,
}: {
  src: string;
  alt: string;
  title: string;
  description: string;
}) => {
  return (
    <div className="w-80 h-50 rounded-xl bg-background-secondry grid grid-rows-4 p-6 hover:scale-105 transition-all border border-border-muted shadow-lg shadow-black/20">
      <div className="w-8 h-8 rounded-sm bg-background-third shadow-black shadow-2xl hover:scale-125 transition-all ">
        <Image src={src} alt={alt} width={80} height={80} />
      </div>
      <h1 className="text-xl font-semibold text-text-primary">{title}</h1>
      <p className="text-sm text-text-secondry">{description}</p>
    </div>
  );
};

export default industriesContainer;
