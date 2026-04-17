import { Request, Response } from 'express';
import { supabase } from '../../../config/supabase';

export const updateColumn = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, color, orderIndex } = req.body;
    const { data, error } = await supabase.from('kanban_columns').update({ name, color, orderIndex }).eq('id', id).select().single();
    if (error) throw error;
    res.json({ column: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
export default updateColumn;
