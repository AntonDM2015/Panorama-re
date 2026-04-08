import { supabaseAdmin } from '../config/supabase';
import { Building } from '../types';

export class BuildingRepository {
  async getAll(): Promise<Building[]> {
    const { data, error } = await supabaseAdmin
      .from('buildings')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    return (data || []).map((row: any) => ({
      id: row.id,
      cityId: row.city_id,
      name: row.name,
      address: row.address,
      description: row.description,
      previewUrl: row.preview_url,
      createdAt: row.created_at,
    }));
  }

  async getByCityId(cityId: string): Promise<Building[]> {
    const { data, error } = await supabaseAdmin
      .from('buildings')
      .select('*')
      .eq('city_id', cityId)
      .order('name', { ascending: true });

    if (error) throw error;

    return (data || []).map((row: any) => ({
      id: row.id,
      cityId: row.city_id,
      name: row.name,
      address: row.address,
      description: row.description,
      previewUrl: row.preview_url,
      createdAt: row.created_at,
    }));
  }

  async getById(id: string): Promise<Building | null> {
    const { data, error } = await supabaseAdmin
      .from('buildings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      cityId: data.city_id,
      name: data.name,
      address: data.address,
      description: data.description,
      previewUrl: data.preview_url,
      createdAt: data.created_at,
    };
  }

  async create(data: { cityId: string; name: string; address?: string; description?: string; previewUrl?: string }): Promise<Building> {
    const { data: result, error } = await supabaseAdmin
      .from('buildings')
      .insert({
        city_id: data.cityId,
        name: data.name,
        address: data.address,
        description: data.description,
        preview_url: data.previewUrl,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: result.id,
      cityId: result.city_id,
      name: result.name,
      address: result.address,
      description: result.description,
      previewUrl: result.preview_url,
      createdAt: result.created_at,
    };
  }

  async update(id: string, updates: { name?: string; address?: string; description?: string; previewUrl?: string }): Promise<Building> {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.address !== undefined) dbUpdates.address = updates.address;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.previewUrl !== undefined) dbUpdates.preview_url = updates.previewUrl;

    const { data, error } = await supabaseAdmin
      .from('buildings')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      cityId: data.city_id,
      name: data.name,
      address: data.address,
      description: data.description,
      previewUrl: data.preview_url,
      createdAt: data.created_at,
    };
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('buildings')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
