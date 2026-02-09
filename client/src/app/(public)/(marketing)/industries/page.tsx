import IndustriesContainer from "@/src/components/ui/industriesContainer";
import ComingSoon from "@/src/components/ui/comingSoon";

const page = () => {
  return (
    <>
      <div className="flex items-center justify-center flex-col px-30 pt-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <IndustriesContainer
            title={"Real Estate Professionals"}
            alt={"home"}
            description="Wholesalers, investors, and agents who need 95% Accurate Home Owners to fuel Your Pockets."
            src={"/home.svg"}
          />
          <IndustriesContainer
            title={"Real Estate Realtors"}
            alt={"Realtors"}
            description="Realtors all across the USA with 100% accruacy rate"
            src={"/realtor.svg"}
          />
          <ComingSoon />
          <ComingSoon />
          <ComingSoon />
          <ComingSoon />
        </div>
      </div>
    </>
  );
};

export default page;
