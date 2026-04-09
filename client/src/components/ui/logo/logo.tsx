"use client";
import Link from "next/link";
import Image from "next/image";

const logo = () => {
  return (
    <Link href={"/"} className="inline-flex relative">
      <h1 className="text-2xl text-text-primary font-extrabold italic">
        <span className="">SKIP</span>SCOPE
      </h1>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="45"
        height="45"
        viewBox="0 0 24 24"
        className="absolute bottom-0 w-3 h-3 -right-4"
        style={{ fill: 'var(--color-brand-primary-strong)' }}
      >
        <path
          d="M11 2v2.07A8 8 0 0 0 4.07 11H2v2h2.07A8 8 0 0 0 11 19.93V22h2v-2.07A8 8 0 0 0 19.93 13H22v-2h-2.07A8 8 0 0 0 13 4.07V2m-2 4.08V8h2V6.09c2.5.41 4.5 2.41 4.92 4.91H16v2h1.91c-.41 2.5-2.41 4.5-4.91 4.92V16h-2v1.91C8.5 17.5 6.5 15.5 6.08 13H8v-2H6.09C6.5 8.5 8.5 6.5 11 6.08M12 11a1 1 0 0 0-1 1a1 1 0 0 0 1 1a1 1 0 0 0 1-1a1 1 0 0 0-1-1"
        />
      </svg>
    </Link>
  );
};

export default logo;
