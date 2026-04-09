"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import api from "@/lib/api";
import toast from "react-hot-toast";
import Image from "next/image";
import statesCounties from "@/public/data/states+counties/data.json";
import statesZips from "@/public/data/states+zipcode/data.json";
import ownerShipCriterias from "@/public/data/ownershipCriteria/data.json";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select";

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
      rows: parseInt(rows),
      county: county === "" ? "N/A" : county,
      motivations: motivation.length === 0 ? "N/A" : motivation.join(","),
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
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <h1 className="text-4xl font-bold text-text-primary uppercase tracking-tight">
          Submit New Request
        </h1>
        <p className="text-text-secondry font-medium">
          Specify your lead criteria and market parameters to initiate a new data extraction.
        </p>
      </div>

      {/* Form Container */}
      <div className="bg-background-secondry/40 backdrop-blur-xl border border-border-light rounded-[2rem] p-10 shadow-2xl shadow-black/20">
        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondry uppercase tracking-wider ml-1">Market Selection *</label>
              <Select value={market} onValueChange={(value) => setMarket(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose Market" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={"state"}>Entire State</SelectItem>
                  <SelectItem value={"county"}>Specific County</SelectItem>
                  <SelectItem value={"zipcode"}>Zip Code Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {market && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondry uppercase tracking-wider ml-1">State *</label>
                <Select value={usState} onValueChange={(value) => setUsState(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose State" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((item: string) => (
                      <SelectItem value={item} key={item}>{item}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {usState && market == "county" && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondry uppercase tracking-wider ml-1">County *</label>
                <Select value={county} onValueChange={(value) => setCounty(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose County" />
                  </SelectTrigger>
                  <SelectContent>
                    {data[usState].map((item: string) => (
                      <SelectItem value={item} key={item}>{item}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {market == "zipcode" && usState && (
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-text-secondry uppercase tracking-wider ml-1">Zip Code *</label>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="e.g., 90210 or 90210-90215"
                    className="w-full px-5 py-3.5 bg-background-main/50 border border-border-light rounded-2xl focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-text-primary font-medium placeholder:text-text-secondry/30"
                  />
                  <div className="p-4 bg-brand-primary/5 border border-brand-primary/20 rounded-2xl">
                    <p className="text-xs font-bold text-brand-primary uppercase tracking-wider mb-2">Format Guidelines</p>
                    <ul className="text-sm text-text-secondry font-medium space-y-1">
                      <li>• Separate multiple codes with a <span className="text-text-primary font-bold">comma (,)</span></li>
                      <li>• Define ranges using a <span className="text-text-primary font-bold">dash (-)</span></li>
                      <li>• Valid range for {usState}: <span className="text-text-primary font-bold">{zip[usState].min} - {zip[usState].max}</span></li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="w-full h-[1px] bg-border-light ml-[-2.5rem] w-[calc(100%+5rem)]" />

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

          <div className="space-y-6">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
              Ownership Criteria
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondry uppercase tracking-wider ml-1">Parameter Selection</label>
                <Select value={ownershipCriteria} onValueChange={(value) => setOwnershipCriteria(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose Parameter" />
                  </SelectTrigger>
                  <SelectContent>
                    {ownerCriteriaValues.map((item: string) => (
                      <SelectItem value={item} key={item}>{item}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {ownershipCriteria && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondry uppercase tracking-wider ml-1">{ownershipCriteria} Options</label>
                  <Select
                    value={ownershipCriteriaOption}
                    onValueChange={(value) => {
                      if (value === "manualInput") {
                        setCustomOwnershipCriteria(true);
                        setOwnershipCriteriaOption("manualInput");
                      } else {
                        setCustomOwnershipCriteria(false);
                        setOwnershipCriteriaOption(value);
                        setOwnershipCriteriaFinale((prev) => {
                          const exists = prev.some((item) => item.key === ownershipCriteria);
                          if (exists) {
                            return prev.map((item) => item.key === ownershipCriteria ? { ...item, value: value } : item);
                          } else {
                            return [...prev, { key: ownershipCriteria, value: value }];
                          }
                        });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Choose ${ownershipCriteria}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {ownerCriteria[ownershipCriteria].map((item: string) => (
                        <SelectItem value={item} key={item}>{item}</SelectItem>
                      ))}
                      <SelectItem value={"manualInput"}>Custom Input...</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {ownershipCriteria && customOwnershipCriteria && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-xs font-bold text-text-secondry uppercase tracking-wider ml-1">Custom Value for {ownershipCriteria}</label>
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={customOwnershipCriteriaFinale}
                    onChange={(e) => setCustomOwnershipCriteriaFinale(e.target.value)}
                    placeholder="Enter custom value"
                    className="flex-1 px-5 py-3.5 bg-background-main/50 border border-border-light rounded-2xl focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-text-primary font-medium"
                  />
                  <button
                    type="button"
                    className="px-8 py-3.5 bg-brand-primary text-text-button rounded-2xl font-bold hover:bg-brand-primary-strong transition-all shadow-lg shadow-brand-primary/20"
                    onClick={() => {
                      setOwnershipCriteriaFinale((prev) => {
                        const exists = prev.some((item) => item.key === ownershipCriteria);
                        if (exists) {
                          return prev.map((item) => item.key === ownershipCriteria ? { ...item, value: customOwnershipCriteriaFinale } : item);
                        } else {
                          return [...prev, { key: ownershipCriteria, value: customOwnershipCriteriaFinale }];
                        }
                      });
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              {ownershipCriteriaFinale.map((item) => (
                <div
                  className="bg-background-third/80 border border-border-light rounded-xl px-4 py-2.5 flex items-center gap-4 group transition-all hover:border-brand-primary/40"
                  key={item.value}
                >
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.1em]">{item.key}</span>
                    <span className="text-sm font-bold text-text-primary">{item.value}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOwnershipCriteriaFinale((prev) => prev.filter((i) => i.value !== item.value))}
                    className="text-text-secondry hover:text-rose-500 transition-colors"
                  >
                    <Image src={"/x.svg"} alt={"remove"} width={12} height={12} className="opacity-40 group-hover:opacity-100" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full h-[1px] bg-border-light ml-[-2.5rem] w-[calc(100%+5rem)]" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondry uppercase tracking-wider ml-1">Volume Requirement *</label>
              <input
                type="number"
                value={rows}
                onChange={(e) => setRows(e.target.value)}
                placeholder="Number of leads needed"
                className="w-full px-5 py-3.5 bg-background-main/50 border border-border-light rounded-2xl focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-text-primary font-medium"
              />
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
              Motivations
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {motivations.map((item: string) => (
                <div key={item} className="group">
                  <input
                    type="checkbox"
                    id={item}
                    name={item}
                    value={item}
                    checked={motivation.includes(item)}
                    className="hidden"
                    onChange={(e) => {
                      const value = e.target.value;
                      setMotivation((prev) =>
                        prev.includes(value) ? prev.filter((m) => m !== value) : [...prev, value],
                      );
                    }}
                  />
                  <label
                    htmlFor={item}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all cursor-pointer ${motivation.includes(item)
                        ? "bg-brand-primary/10 border-brand-primary/50 text-text-primary shadow-sm"
                        : "bg-background-main/30 border-border-light text-text-secondry hover:border-text-secondry/30"
                      }`}
                  >
                    <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${motivation.includes(item) ? "bg-brand-primary border-brand-primary" : "border-text-secondry/40"
                      }`}>
                      {motivation.includes(item) && <Image src="/tick.svg" alt="tick" width={10} height={10} />}
                    </div>
                    <span className="text-sm font-medium">{item}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondry uppercase tracking-wider ml-1">Additional Specifications</label>
            <textarea
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="Provide any additional context or specific requirements..."
              rows={4}
              className="w-full px-5 py-3.5 bg-background-main/50 border border-border-light rounded-2xl focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-text-primary font-medium resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-brand-primary text-text-button rounded-2xl font-bold text-lg hover:bg-brand-primary-strong transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-brand-primary/20 flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-text-button/30 border-t-text-button rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              "Complete Request Submission"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
