import { Request, Response } from 'express';
import { supabase } from '../../../config/supabase';

export const deleteColumn = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('kanban_columns').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
export default deleteColumn;

