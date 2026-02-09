import { AuthRequest } from "../../../middleware/auth";
import { Response } from "express";
import { supabase } from "../../../config/supabase";

const downloadHistoryCsv = async (req: AuthRequest, res: Response) => {
  try {
    const { data: requests, error } = await supabase
      .from("requests")
      .select("*")
      .eq("user_id", req.userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    // Generate CSV
    const headers = [
      "Request ID",
      "County",
      "Package",
      "Status",
      "Date",
      "Updated",
    ];
    const rows = requests.map((req: any) => [
      req.id,
      req.county,
      req.package,
      req.status,
      new Date(req.created_at).toLocaleDateString(),
      new Date(req.updated_at || req.created_at).toLocaleDateString(),
    ]);

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join(
      "\n",
    );

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=request-history.csv",
    );
    res.send(csv);
  } catch (error) {
    console.error("Download CSV error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default downloadHistoryCsv;
