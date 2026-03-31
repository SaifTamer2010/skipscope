import { Response } from "express";
import { supabase } from "../../../config/supabase";
import { AdminRequest } from "../../../middleware/adminAuth";

const updateFinancials = async (
  req: AdminRequest,
  res: Response,
): Promise<void> => {
  try {
    const { requestId, invoiceAmount, expenses, profit } = req.body;

    if (!requestId || invoiceAmount === undefined || expenses === undefined || profit === undefined) {
      res.status(400).json({ error: "Missing required financial fields" });
      return;
    }

    const { error: updateError } = await supabase
      .from("requests")
      .update({
        invoice_amount: parseFloat(invoiceAmount),
        expenses: parseFloat(expenses),
        profit: parseFloat(profit),
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    if (updateError) throw updateError;

    res.json({ success: true, message: "Financials updated successfully" });
  } catch (error: any) {
    console.error("Update financials error:", error);
    res.status(500).json({ error: "Failed to update financials" });
  }
};

export default updateFinancials;
