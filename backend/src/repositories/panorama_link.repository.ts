import { supabaseAdmin } from '../config/supabase';
import { PanoramaLink } from '../types';

export class PanoramaLinkRepository {
  async getByPanoramaId(panoramaId: string): Promise<PanoramaLink[]> {
    const { data, error } = await supabaseAdmin
      .from('panorama_links')
      .select('*')
      .eq('from_panorama_id', panoramaId);

    if (error) throw error;

    return (data || []).map(this.mapToPanoramaLink);
  }

  async create(data: { fromPanoramaId: string; toPanoramaId: string; direction?: string }): Promise<PanoramaLink> {
    console.log('[PanoramaLinkRepository.create] Inserting:', {
      from_panorama_id: data.fromPanoramaId,
      to_panorama_id: data.toPanoramaId,
      direction: data.direction || null,
    });

    const { data: result, error } = await supabaseAdmin
      .from('panorama_links')
      .insert({
        from_panorama_id: data.fromPanoramaId,
        to_panorama_id: data.toPanoramaId,
        direction: data.direction || null,
      })
      .select()
      .single();

    if (error) {
      console.error('[PanoramaLinkRepository.create] Supabase error:', error);
      throw new Error(`Ошибка при создании связи: ${error.message || 'Неизвестная ошибка'}`);
    }

    console.log('[PanoramaLinkRepository.create] Success:', result);
    return this.mapToPanoramaLink(result);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('panorama_links')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async deleteByPanoramaId(panoramaId: string): Promise<void> {
    await supabaseAdmin
      .from('panorama_links')
      .delete()
      .or(`from_panorama_id.eq.${panoramaId},to_panorama_id.eq.${panoramaId}`);
  }

  private mapToPanoramaLink(row: any): PanoramaLink {
    return {
      id: row.id,
      fromPanoramaId: row.from_panorama_id,
      toPanoramaId: row.to_panorama_id,
      direction: row.direction,
      createdAt: row.created_at,
    };
  }
}
