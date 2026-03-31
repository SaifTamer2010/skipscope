import express from "express";
import { supabase } from "../config/supabase";
import { requireAdmin } from "../middleware/adminAuth";

const router = express.Router();

router.use(requireAdmin);

// Get all providers
router.get("/", async (req, res) => {
  try {
    const { data: providers, error } = await supabase
      .from("providers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json({ providers });
  } catch (error) {
    console.error("GET /providers error:", error);
    res.status(500).json({ error: "Failed to fetch providers" });
  }
});

// Create a new provider
router.post("/", async (req, res) => {
  try {
    const { name, price_per_lead } = req.body;
    console.log(price_per_lead)
    console.log(parseFloat(price_per_lead))
    if (!name || isNaN(price_per_lead)) {
      return res.status(400).json({ error: "Name and valid price required" });
    }

    const { data: provider, error } = await supabase
      .from("providers")
      .insert({
        name,
        price_per_lead: parseFloat(price_per_lead),
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ provider });
  } catch (error) {
    console.error("POST /providers error:", error);
    res.status(500).json({ error: "Failed to create provider" });
  }
});

// Update a provider
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price_per_lead } = req.body;

    const { data: provider, error } = await supabase
      .from("providers")
      .update({
        name,
        price_per_lead: price_per_lead ? parseFloat(price_per_lead) : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    res.json({ provider });
  } catch (error) {
    console.error("PUT /providers/:id error:", error);
    res.status(500).json({ error: "Failed to update provider" });
  }
});

// Delete a provider
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("providers")
      .delete()
      .eq("id", id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error("DELETE /providers/:id error:", error);
    res.status(500).json({ error: "Failed to delete provider" });
  }
});

export default router;
