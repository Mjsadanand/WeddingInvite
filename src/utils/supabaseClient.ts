import { createClient } from '@supabase/supabase-js'

export type GalleryImage = {
  id: string
  image_url: string
  created_at: string
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : null

const TABLE_NAME = 'wedding_gallery'
const BUCKET_NAME = 'wedding-images'

const getSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase is not configured.')
  }
  return supabase
}

export async function fetchWeddingImages() {
  const client = getSupabase()
  const { data, error } = await client
    .from(TABLE_NAME)
    .select('id, image_url, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data ?? []
}

export async function saveGalleryImageUrl(imageUrl: string): Promise<GalleryImage> {
  const client = getSupabase()

  const { data, error: insertError } = await client
    .from(TABLE_NAME)
    .insert([{ image_url: imageUrl }])
    .select('id, image_url, created_at')
    .single()

  if (insertError) {
    throw new Error(insertError.message)
  }

  return data
}

export async function deleteGalleryImage(imageId: string): Promise<void> {
  const client = getSupabase()

  const { error } = await client.from(TABLE_NAME).delete().eq('id', imageId)

  if (error) {
    throw new Error(error.message)
  }
}

export async function uploadWeddingImage(file: File): Promise<GalleryImage> {
  const client = getSupabase()
  const extension = file.name.split('.').pop() ?? 'jpg'
  const fileName = `${Date.now()}-${crypto.randomUUID()}.${extension}`

  const { error: uploadError } = await client.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, { cacheControl: '3600', upsert: false })

  if (uploadError) {
    throw new Error(uploadError.message)
  }

  const { data: publicUrlData } = client.storage.from(BUCKET_NAME).getPublicUrl(fileName)

  const { data, error: insertError } = await client
    .from(TABLE_NAME)
    .insert([{ image_url: publicUrlData.publicUrl }])
    .select('id, image_url, created_at')
    .single()

  if (insertError) {
    throw new Error(insertError.message)
  }

  return data
}

export function subscribeToGallery(onChange: () => void) {
  const client = getSupabase()
  return client
    .channel('wedding-gallery-channel')
    .on('postgres_changes', { event: '*', schema: 'public', table: TABLE_NAME }, onChange)
    .subscribe()
}
