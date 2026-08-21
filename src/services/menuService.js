import { supabase } from '../lib/supabaseClient';

/**
 * Fetches active categories from database.
 */
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Failed to fetch categories:', error);
    throw new Error(error.message || 'Unable to load menu categories.');
  }

  return data || [];
}

/**
 * Fetches available menu items, optionally filtered by category.
 */
export async function getMenuItems(categoryId = null) {
  let query = supabase
    .from('menu_items')
    .select('*, categories(*)')
    .eq('is_available', true)
    .order('created_at', { ascending: true });

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to fetch menu items:', error);
    throw new Error(error.message || 'Unable to load menu items.');
  }

  return data || [];
}
