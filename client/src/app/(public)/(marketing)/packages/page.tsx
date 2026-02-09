import PackagesContainer from "@/src/components/ui/packagesContainer";

const page = () => {
  return (
    <>
      <div className="flex items-center justify-center flex-col px-30 pt-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          <PackagesContainer
            title={"Starter"}
            alt={"home"}
            description="up to 3 phone numbers for each owner best for startups VAs or indvidual callers"
            src={"/startup.svg"}
            records="15K ~ 20K Records"
          />
          <PackagesContainer
            title={"Growth"}
            alt={"home"}
            description="up to 6 Phone Numbers for each owner / relative best for small to midsize VAs or indvidual clients and Faster shipping"
            src={"/growth.svg"}
            records="30K ~ 80K Records"
            poweredByActive={true}
            poweredBy={"Best Seller"}
          />
          <PackagesContainer
            title={"Pro"}
            alt={"home"}
            description="Up to 6 Phone Numbers for each owner and relative best for mid to big VAs or companies or clients that outreach more than 50k owners a day and slightly FASTER shipping"
            src={"/company.svg"}
            records="100K ~ 250K Records"
          />
          <PackagesContainer
            title={"Enterprise"}
            alt={"Enterprise"}
            description="Up to 6 Phone Numbers for each owner and relative + Discounts for Big Data and reaching the Priority List"
            src={"/enterprise.svg"}
            records="500K+ Records"
          />
        </div>
      </div>
    </>
  );
};

export default page;

// Icon idea: Single house outline / map pin
// Description:

// Icon idea: Multiple houses / stacked layers
// Description:

//

// Icon idea: Chart over a house / analytics dashboard
// Description:

// Enterprise

// Icon idea: Gear + database / network nodes
// Description:
// Custom scraping, enrichment, and integrations.
// Built for scale, automation, and unique data needs.
