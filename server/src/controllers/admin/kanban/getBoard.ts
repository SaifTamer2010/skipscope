import { Response } from "express";
import { supabase } from "../../../config/supabase";
import { AdminRequest } from "../../../middleware/adminAuth";

const getBoard = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    // Get all columns
    const { data: columns, error: columnsError } = await supabase
      .from("kanban_columns")
      .select("*")
      .eq("is_active", true)
      .order("order_index", { ascending: true });

    if (columnsError) throw columnsError;

    // Get all requests with related data
    const { data: requests, error: requestsError } = await supabase
      .from("requests")
      .select(
        `
        *,
        users (
          id,
          email
        ),
        admin_users (
          id,
          username,
          display_name
        ),
        kanban_columns (
          id,
          name,
          color
        )
      `,
      )
      .order("kanban_order", { ascending: true });

    if (requestsError) throw requestsError;

    // Get file counts for each request
    const requestIds = requests?.map((r) => r.id) || [];

    const { data: adminFileCounts } = await supabase
      .from("admin_files")
      .select("request_id")
      .in("request_id", requestIds);

    const { data: clientFileCounts } = await supabase
      .from("client_files")
      .select("request_id")
      .in("request_id", requestIds);

    // Create file count maps
    const adminFileMap: Record<string, number> = {};
    const clientFileMap: Record<string, number> = {};

    adminFileCounts?.forEach((f) => {
      adminFileMap[f.request_id] = (adminFileMap[f.request_id] || 0) + 1;
    });

    clientFileCounts?.forEach((f) => {
      clientFileMap[f.request_id] = (clientFileMap[f.request_id] || 0) + 1;
    });

    // Identify default column ID (first one)
    const defaultColumnId =
      columns && columns.length > 0 ? columns[0].id : null;

    // Organize requests by column
    const board =
      columns?.map((column) => ({
        id: column.id,
        name: column.name,
        color: column.color,
        orderIndex: column.order_index,
        requests:
          requests
            ?.filter(
              (r) =>
                r.kanban_column_id === column.id ||
                (defaultColumnId &&
                  column.id === defaultColumnId &&
                  r.kanban_column_id === null),
            )
            .map((r) => ({
              ...r,
              adminFileCount: adminFileMap[r.id] || 0,
              clientFileCount: clientFileMap[r.id] || 0,
            })) || [],
      })) || [];

    res.json({ board });
  } catch (error: any) {
    console.error("Get kanban board error:", error);
    res.status(500).json({ error: "Failed to fetch kanban board" });
  }
};

export default getBoard;
