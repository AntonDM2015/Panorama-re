import { supabaseAdmin } from '../config/supabase';
import { City } from '../types';

export class CityRepository {
  async getAll(): Promise<City[]> {
    const { data, error } = await supabaseAdmin
      .from('cities')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    return (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      country: row.country,
      createdAt: row.created_at,
    }));
  }

  async getById(id: string): Promise<City | null> {
    const { data, error } = await supabaseAdmin
      .from('cities')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      name: data.name,
      country: data.country,
      createdAt: data.created_at,
    };
  }

  async create(name: string, country: string = 'Россия'): Promise<City> {
    const { data, error } = await supabaseAdmin
      .from('cities')
      .insert({ name, country })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      country: data.country,
      createdAt: data.created_at,
    };
  }

  async update(id: string, updates: { name?: string; country?: string }): Promise<City> {
    const { data, error } = await supabaseAdmin
      .from('cities')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      country: data.country,
      createdAt: data.created_at,
    };
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('cities')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
