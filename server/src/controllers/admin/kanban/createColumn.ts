import { Request, Response } from 'express';
import { supabase } from '../../../config/supabase';

export const createColumn = async (req: Request, res: Response) => {
  try {
    const { name, color, orderIndex } = req.body;
    const { data, error } = await supabase.from('kanban_columns').insert({ name, color, orderIndex: orderIndex || 0 }).select().single();
    if (error) throw error;
    res.json({ column: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
export default createColumn;

