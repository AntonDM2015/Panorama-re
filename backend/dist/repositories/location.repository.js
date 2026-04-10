"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationRepository = void 0;
const supabase_1 = require("../config/supabase");
class LocationRepository {
    async getAll() {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('locations')
            .select('*')
            .order('name', { ascending: true });
        if (error)
            throw error;
        return (data || []).map((row) => ({
            id: row.id,
            buildingId: row.building_id,
            name: row.name,
            description: row.description,
            floor: row.floor,
            type: row.type,
            roomNumber: row.room_number,
            previewUrl: row.preview_url,
            panoramaUrl: row.panorama_url,
            createdAt: row.created_at,
        }));
    }
    async getByBuildingId(buildingId) {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('locations')
            .select('*')
            .eq('building_id', buildingId)
            .order('floor', { ascending: true })
            .order('name', { ascending: true });
        if (error)
            throw error;
        return (data || []).map((row) => ({
            id: row.id,
            buildingId: row.building_id,
            name: row.name,
            description: row.description,
            floor: row.floor,
            type: row.type,
            roomNumber: row.room_number,
            previewUrl: row.preview_url,
            panoramaUrl: row.panorama_url,
            createdAt: row.created_at,
        }));
    }
    async getById(id) {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('locations')
            .select('*')
            .eq('id', id)
            .single();
        if (error)
            throw error;
        if (!data)
            return null;
        return {
            id: data.id,
            buildingId: data.building_id,
            name: data.name,
            description: data.description,
            floor: data.floor,
            type: data.type,
            roomNumber: data.room_number,
            previewUrl: data.preview_url,
            panoramaUrl: data.panorama_url,
            createdAt: data.created_at,
        };
    }
    async create(data) {
        const { data: result, error } = await supabase_1.supabaseAdmin
            .from('locations')
            .insert({
            building_id: data.buildingId,
            name: data.name,
            description: data.description,
            floor: data.floor,
            type: data.type || 'location',
            room_number: data.roomNumber,
            preview_url: data.previewUrl,
            panorama_url: data.panoramaUrl,
        })
            .select()
            .single();
        if (error)
            throw error;
        return {
            id: result.id,
            buildingId: result.building_id,
            name: result.name,
            description: result.description,
            floor: result.floor,
            type: result.type,
            roomNumber: result.room_number,
            previewUrl: result.preview_url,
            panoramaUrl: result.panorama_url,
            createdAt: result.created_at,
        };
    }
    async update(id, updates) {
        const dbUpdates = {};
        if (updates.name !== undefined)
            dbUpdates.name = updates.name;
        if (updates.description !== undefined)
            dbUpdates.description = updates.description;
        if (updates.floor !== undefined)
            dbUpdates.floor = updates.floor;
        if (updates.type !== undefined)
            dbUpdates.type = updates.type;
        if (updates.roomNumber !== undefined)
            dbUpdates.room_number = updates.roomNumber;
        if (updates.previewUrl !== undefined)
            dbUpdates.preview_url = updates.previewUrl;
        if (updates.panoramaUrl !== undefined)
            dbUpdates.panorama_url = updates.panoramaUrl;
        const { data, error } = await supabase_1.supabaseAdmin
            .from('locations')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw error;
        return {
            id: data.id,
            buildingId: data.building_id,
            name: data.name,
            description: data.description,
            floor: data.floor,
            type: data.type,
            roomNumber: data.room_number,
            previewUrl: data.preview_url,
            panoramaUrl: data.panorama_url,
            createdAt: data.created_at,
        };
    }
    async delete(id) {
        const { error } = await supabase_1.supabaseAdmin
            .from('locations')
            .delete()
            .eq('id', id);
        if (error)
            throw error;
    }
}
exports.LocationRepository = LocationRepository;
