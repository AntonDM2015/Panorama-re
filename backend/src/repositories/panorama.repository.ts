import { supabaseAdmin } from '../config/supabase';
import { PanoramaImage } from '../types';

export class PanoramaRepository {
  async getByLocationId(locationId: string): Promise<PanoramaImage[]> {
    const { data, error } = await supabaseAdmin
      .from('panoramas')
      .select('*')
      .eq('location_id', locationId)
      .order('sort_order', { ascending: true });

    if (error) throw error;

    return (data || []).map((row: any) => ({
      id: row.id,
      locationId: row.location_id,
      url: row.url,
      title: row.title,
      sortOrder: row.sort_order,
      createdAt: row.created_at,
    }));
  }
  async getAll(): Promise<PanoramaImage[]> {
    const { data, error } = await supabaseAdmin
      .from('panoramas')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;

    return (data || []).map((row: any) => ({
      id: row.id,
      locationId: row.location_id,
      url: row.url,
      title: row.title,
      sortOrder: row.sort_order,
      createdAt: row.created_at,
    }));
  }

  async getById(id: string): Promise<PanoramaImage | null> {
    const { data, error } = await supabaseAdmin
      .from('panoramas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      locationId: data.location_id,
      url: data.url,
      title: data.title,
      sortOrder: data.sort_order,
      createdAt: data.created_at,
    };
  }

  async create(data: { locationId: string; url: string; title?: string; sortOrder?: number }): Promise<PanoramaImage> {
    const { data: result, error } = await supabaseAdmin
      .from('panoramas')
      .insert({
        location_id: data.locationId,
        url: data.url,
        title: data.title,
        sort_order: data.sortOrder || 0,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: result.id,
      locationId: result.location_id,
      url: result.url,
      title: result.title,
      sortOrder: result.sort_order,
      createdAt: result.created_at,
    };
  }

  async update(id: string, updates: { url?: string; title?: string; sortOrder?: number }): Promise<PanoramaImage> {
    const dbUpdates: any = {};
    if (updates.url !== undefined) dbUpdates.url = updates.url;
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.sortOrder !== undefined) dbUpdates.sort_order = updates.sortOrder;

    const { data, error } = await supabaseAdmin
      .from('panoramas')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      locationId: data.location_id,
      url: data.url,
      title: data.title,
      sortOrder: data.sort_order,
      createdAt: data.created_at,
    };
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('panoramas')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async deleteByLocationId(locationId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('panoramas')
      .delete()
      .eq('location_id', locationId);

    if (error) throw error;
  }
}
