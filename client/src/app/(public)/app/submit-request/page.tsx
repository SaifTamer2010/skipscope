"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import api from "@/lib/api";
import toast from "react-hot-toast";
import Image from "next/image";
import statesCounties from "@/public/data/states+counties/data.json";
import statesZips from "@/public/data/states+zipcode/data.json";
import ownerShipCriterias from "@/public/data/ownershipCriteria/data.json";

const motivations: string[] = [
  "Active Foreclosures",
  "Absentee",
  "Absentee Out Of State",
  "Tax Delinquent",
  "Expired Listings",
  "Intrafamily Transfer",
  "Owner in Nursing Home",
  "Distressed Properties",
  "Financial Distressed",
  "Potential Absentee",
  "Potential Inherited",
  "Potential Divorced",
  "Potential Deceased",
  "Deceased",
  "Top Zip Codes",
  "Top Land Zip Codes",
];

type CountiesByState = {
  [state: string]: string[];
};

type StateZips = {
  [state: string]: { min: string; max: string };
};

type ownerShipCriteria = {
  [option: string]: string[];
};

type CriteriaItem = {
  key: string;
  value: string;
};

const data: CountiesByState = statesCounties;
const zip: StateZips = statesZips;
const ownerCriteria: ownerShipCriteria = ownerShipCriterias;

const states: string[] = Object.keys(data);
const ownerCriteriaValues: string[] = Object.keys(ownerCriteria);

export default function SubmitRequestPage() {
  //data states
  const [market, setMarket] = useState("");
  const [usState, setUsState] = useState("");
  const [county, setCounty] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [ownershipCriteriaFinale, setOwnershipCriteriaFinale] = useState<
    CriteriaItem[]
  >([]);
  const [customOwnershipCriteriaFinale, setCustomOwnershipCriteriaFinale] =
    useState("");

  const [rows, setRows] = useState("");
  const [motivation, setMotivation] = useState<string[]>([]);
  const [customNotes, setCustomNotes] = useState("");

  //ui states
  const [loading, setLoading] = useState(false);
  const [ownershipCriteriaOption, setOwnershipCriteriaOption] = useState("");
  const [ownershipCriteria, setOwnershipCriteria] = useState("");
  const [customOwnershipCriteria, setCustomOwnershipCriteria] = useState(false);

  // submission to backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!market || !usState || !rows) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);

    const payload = {
      rows: rows === "" ? "N/A" : rows,
      county: county === "" ? "N/A" : county,
      motivations: county === "" ? "N/A" : motivation.join(","),
      state: usState === "" ? "N/A" : usState,
      zipCode: zipCode === "" ? "N/A" : zipCode,
      ownershipCriteriaFinale: ownershipCriteriaFinale,
      market: market === "" ? "N/A" : market,
      customNotes: customNotes === "" ? "N/A" : customNotes,
    };

    try {
      await api.post("/requests", payload);
      toast.success("Request submitted successfully!");
      setRows("");
      setCounty("");
      setUsState("");
      setOwnershipCriteria("");
      setOwnershipCriteria("");
      setOwnershipCriteriaFinale([]);
      setCustomNotes("");
      setMotivation([]);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2 text-text-primary">
          Submit a Request
        </h1>
        <p className="text-text-secondry">Create a new List Request.</p>
      </div>

      {/* Submit Modal */}
      <div title="Submit Request">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Market *</label>
            <select
              className="w-full px-4 py-3 bg-background-main border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-white"
              value={market}
              onChange={(e) => setMarket(e.target.value)}
            >
              <option disabled value={""}>
                Choose Market
              </option>

              <option value={"state"}>State</option>
              <option value={"county"}>County</option>
              <option value={"zipcode"}>Zip Code</option>
            </select>
          </div>

          {market && (
            <div>
              <label className="block text-sm font-medium mb-2">State *</label>
              <select
                className="w-full px-4 py-3 bg-background-main border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                value={usState}
                onChange={(e) => {
                  setUsState(e.target.value);
                }}
              >
                <option disabled value={""}>
                  Choose State
                </option>
                {states.map((item: string) => (
                  <option value={item} key={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          )}

          {usState && market == "county" && (
            <div>
              <label className="block text-sm font-medium mb-2">County *</label>
              <select
                className="w-full px-4 py-3 bg-background-main border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                value={county}
                onChange={(e) => setCounty(e.target.value)}
              >
                <option disabled value={""}>
                  Choose County
                </option>
                {data[usState].map((item: string) => (
                  <option value={item} key={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          )}

          {market == "zipcode" && usState && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Zip Code *
              </label>
              <input
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="Enter Zip Code"
                className="w-full px-4 py-3 bg-background-main border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 transition-colors appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <div className="my-4 ml-4 font-medium">
                <span>Zip Codes can be entered in 2 formats:</span>
                <ul>
                  <li>
                    Separated by <b>comma (,)</b>
                  </li>
                  <li>
                    Range - <b>Start</b> and <b>End</b> values must be separated
                    by <b>dash (-)</b>
                  </li>
                </ul>
                <span>
                  {" "}
                  Allowed Zip Codes range for the selected state:&nbsp;{" "}
                  <b>
                    {" "}
                    {zip[usState].min} : {zip[usState].max}
                  </b>
                </span>
              </div>
            </div>
          )}

          {/* <div>
            <label className="block text-sm font-medium mb-2">
              Property Criteria
            </label>
            <select
              className="w-full px-4 py-3 bg-background-main border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-white"
              value={propertyCriteria}
              onChange={(e) => setPropertyCriteria(e.target.value)}
            >
              <option disabled value={""}>
                Choose State
              </option>
              {states.map((item: string) => (
                <option value={item}>{item}</option>
              ))}
            </select>
          </div> */}

          <div>
            <label className="block text-sm font-medium mb-2">
              Ownership Criteria
            </label>

            <select
              className="w-full px-4 py-3 bg-background-main border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-white"
              value={ownershipCriteria}
              onChange={(e) => {
                setOwnershipCriteria(e.target.value);
              }}
            >
              <option disabled value={""}>
                Choose Ownership Criteria
              </option>
              {ownerCriteriaValues.map((item: string) => (
                <option value={item} key={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {ownershipCriteria && (
            <div>
              <label className="block text-sm font-medium mb-2">
                {ownershipCriteria}
              </label>

              <select
                className="w-full px-4 py-3 bg-background-main border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                value={ownershipCriteriaOption}
                onChange={(e) => {
                  if (e.target.value === "manualInput") {
                    setCustomOwnershipCriteria(true);
                    setOwnershipCriteriaOption("manualInput");
                  } else {
                    setCustomOwnershipCriteria(false);
                    setOwnershipCriteriaOption(e.target.value);
                    setOwnershipCriteriaFinale((prev) => {
                      // Check if this key already exists
                      const exists = prev.some(
                        (item) => item.key === ownershipCriteria,
                      );

                      if (exists) {
                        // Update existing
                        return prev.map((item) =>
                          item.key === ownershipCriteria
                            ? { ...item, value: e.target.value }
                            : item,
                        );
                      } else {
                        // Add new
                        return [
                          ...prev,
                          { key: ownershipCriteria, value: e.target.value },
                        ];
                      }
                    });
                  }
                }}
              >
                <option disabled value={""}>
                  Choose {ownershipCriteria}
                </option>
                {ownerCriteria[ownershipCriteria].map((item: string) => (
                  <option value={item} key={item}>
                    {item}
                  </option>
                ))}
                <option value={"manualInput"}>Manual Input</option>
              </select>
            </div>
          )}

          {ownershipCriteria && customOwnershipCriteria && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Manual Input
              </label>
              <div className="grid grid-cols-[1fr_10rem] gap-4">
                <input
                  type="text"
                  value={customOwnershipCriteriaFinale}
                  onChange={(e) =>
                    setCustomOwnershipCriteriaFinale(e.target.value)
                  }
                  placeholder="How Many Rows you need"
                  className="w-full px-4 py-3 bg-background-main border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 transition-colors appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <button
                  type="button"
                  className="w-full py-3 bg-background-third rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                  onClick={() => {
                    setOwnershipCriteriaFinale((prev) => {
                      // Check if this key already exists
                      const exists = prev.some(
                        (item) => item.key === ownershipCriteria,
                      );

                      if (exists) {
                        // Update existing
                        return prev.map((item) =>
                          item.key === ownershipCriteria
                            ? { ...item, value: customOwnershipCriteriaFinale }
                            : item,
                        );
                      } else {
                        // Add new
                        return [
                          ...prev,
                          {
                            key: ownershipCriteria,
                            value: customOwnershipCriteriaFinale,
                          },
                        ];
                      }
                    });
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-4 gap-6">
            {ownershipCriteriaFinale.map((item) => (
              <div
                className="bg-background-third rounded-xl w-50 p-3 inline-flex justify-between "
                key={item.value}
              >
                <p className="text-sm">
                  <span className="text-text-primary font-semibold">
                    {item.key} :
                  </span>
                </p>

                <span className="text-text-secondry text-sm">
                  {" "}
                  {item.value}
                </span>
                <Image
                  src={"/x.svg"}
                  alt={"close"}
                  width={15}
                  height={15}
                  className="opacity-0 cursor-pointer mt-1 hover:opacity-100 transition-all"
                  onClick={() => {
                    setOwnershipCriteriaFinale((prev) =>
                      prev.filter((i) => i.value !== item.value),
                    );
                  }}
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Total Leads *
            </label>
            <input
              type="number"
              value={rows}
              onChange={(e) => setRows(e.target.value)}
              placeholder="How Many Rows you need"
              className="w-full px-4 py-3 bg-background-main border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 transition-colors appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Motivation</label>
            <div className="grid grid-cols-3 max-w-full gap-2">
              {motivations.map((item: string) => (
                <div key={item} className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={item}
                    name={item}
                    value={item}
                    checked={motivation.includes(item)}
                    className="relative hidden peer"
                    onChange={(e) => {
                      const value = e.target.value;
                      setMotivation((prev) =>
                        prev.includes(value)
                          ? prev.filter((m) => m !== value)
                          : [...prev, value],
                      );
                    }}
                  />
                  <label
                    htmlFor={item}
                    className="w-5 h-5 rounded-md bg-background-third border-slate-800 border cursor-pointer hover:bg-slate-900 peer-checked:bg-purple-500 peer-checked:border-purple-800 relative flex items-center justify-center"
                  ></label>
                  <Image
                    src={"/tick.svg"}
                    alt="tick"
                    width={20}
                    height={20}
                    className="absolute hidden peer-checked:block pointer-events-none"
                  />
                  <label htmlFor={item} className="cursor-pointer select-none">
                    {item}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Custom Notes
            </label>
            <textarea
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="Enter custom notes"
              className="w-full px-4 py-3 bg-background-main border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-background-third rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      </div>
    </div>
  );
}
