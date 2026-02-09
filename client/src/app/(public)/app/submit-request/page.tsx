"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import api from "@/lib/api";
import toast from "react-hot-toast";
import Image from "next/image";

const options: string[] = [
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

export default function SubmitRequestPage() {
  const [rows, setRows] = useState("");
  const [county, setCounty] = useState("");
  const [motivation, setMotivation] = useState<string[]>([]);
  const [customNotes, setCustomNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!county || !rows || motivation.length === 0) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    const payload = {
      county,
      rows,
      motivation: motivation.join(","),
      customNotes: customNotes,
    };
    try {
      await api.post("/requests", payload);
      toast.success("Request submitted successfully!");
      setCounty("");
      setRows("");
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
        <p className="text-text-secondry">
          Create a new data request for your county.
        </p>
      </div>

      {/* Submit Modal */}
      <div title="Submit Request">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* County Input */}
          <div>
            <label className="block text-sm font-medium mb-2">County</label>
            <input
              type="text"
              value={county}
              onChange={(e) => setCounty(e.target.value)}
              placeholder="Enter county name"
              className="w-full px-4 py-3 bg-background-main border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Rows</label>
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
              {options.map((item: string) => (
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
