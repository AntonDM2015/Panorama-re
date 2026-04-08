import { supabaseAdmin } from '../config/supabase';
import { NavigationLink } from '../types';

export class NavigationRepository {
  async getByLocationId(locationId: string): Promise<NavigationLink[]> {
    const { data, error } = await supabaseAdmin
      .from('navigation_links')
      .select('*')
      .eq('from_location_id', locationId);

    if (error) throw error;

    return (data || []).map(this.mapToNavigationLink);
  }

  async create(data: { fromLocationId: string; toLocationId: string; direction?: string }): Promise<NavigationLink> {
    const { data: result, error } = await supabaseAdmin
      .from('navigation_links')
      .insert({
        from_location_id: data.fromLocationId,
        to_location_id: data.toLocationId,
        direction: data.direction || null,
      })
      .select()
      .single();

    if (error) throw error;

    return this.mapToNavigationLink(result);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('navigation_links')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async deleteByLocationId(locationId: string): Promise<void> {
    // Delete links where this location is either from or to
    await supabaseAdmin
      .from('navigation_links')
      .delete()
      .or(`from_location_id.eq.${locationId},to_location_id.eq.${locationId}`);
  }

  private mapToNavigationLink(row: any): NavigationLink {
    return {
      id: row.id,
      fromLocationId: row.from_location_id,
      toLocationId: row.to_location_id,
      direction: row.direction,
      createdAt: row.created_at,
    };
  }
}
