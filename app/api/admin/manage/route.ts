import { NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/adminAuth'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

const resources = ['categories', 'products'] as const
type Resource = (typeof resources)[number]
type JsonRecord = Record<string, unknown>

function isResource(value: unknown): value is Resource {
  return typeof value === 'string' && resources.includes(value as Resource)
}

async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  }
  return null
}

function pickCategory(data: JsonRecord) {
  return {
    name: String(data.name ?? '').trim(),
    slug: String(data.slug ?? '').trim().toLowerCase(),
    sort_order: typeof data.sort_order === 'number' ? data.sort_order : 0,
  }
}

function pickProduct(data: JsonRecord) {
  return {
    category_id: Number(data.category_id),
    name: String(data.name ?? '').trim(),
    description: String(data.description ?? '').trim() || null,
    price: Number(data.price),
    in_stock: typeof data.in_stock === 'boolean' ? data.in_stock : true,
    sort_order: typeof data.sort_order === 'number' ? data.sort_order : 0,
  }
}

function sanitize(resource: Resource, data: JsonRecord): JsonRecord {
  if (resource === 'categories') return pickCategory(data)
  return pickProduct(data)
}

function isValid(resource: Resource, data: JsonRecord) {
  const hasText = (key: string) => typeof data[key] === 'string' && data[key].trim().length > 0
  const isPositiveNumber = (key: string) => typeof data[key] === 'number' && data[key] >= 0

  if (resource === 'categories') {
    return hasText('name') && hasText('slug') && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(data.slug))
  }
  return hasText('name') && isPositiveNumber('price') && isPositiveNumber('category_id')
}

export async function GET() {
  const denied = await requireAdmin()
  if (denied) return denied

  try {
    const supabase = getSupabaseAdmin()
    const [cats, prods] = await Promise.all([
      supabase.from('categories').select('*').order('sort_order'),
      supabase.from('products').select('*').order('sort_order'),
    ])

    if (cats.error || prods.error) {
      throw cats.error ?? prods.error
    }

    return NextResponse.json({ categories: cats.data ?? [], products: prods.data ?? [] })
  } catch (error) {
    console.error('Lecture administration impossible :', error)
    return NextResponse.json({ error: 'Impossible de charger les données.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const denied = await requireAdmin()
  if (denied) return denied

  try {
    const body = await request.json() as { resource?: unknown; data?: unknown }
    if (!isResource(body.resource) || !body.data || typeof body.data !== 'object' || Array.isArray(body.data)) {
      return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 })
    }

    const data = sanitize(body.resource, body.data as JsonRecord)
    if (!isValid(body.resource, data)) {
      return NextResponse.json({ error: 'Des champs obligatoires sont manquants ou invalides.' }, { status: 400 })
    }

    const { error } = await getSupabaseAdmin().from(body.resource).insert(data)
    if (error) throw error

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('Création administration impossible :', error)
    return NextResponse.json({ error: 'Impossible d’enregistrer la donnée.' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const denied = await requireAdmin()
  if (denied) return denied

  try {
    const body = await request.json() as { resource?: unknown; id?: unknown; data?: unknown }
    const id = Number(body.id)
    if (!isResource(body.resource) || !Number.isSafeInteger(id) || id < 1 || !body.data || typeof body.data !== 'object' || Array.isArray(body.data)) {
      return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 })
    }

    const data = sanitize(body.resource, body.data as JsonRecord)
    if (!isValid(body.resource, data)) {
      return NextResponse.json({ error: 'Des champs obligatoires sont manquants ou invalides.' }, { status: 400 })
    }

    const { error } = await getSupabaseAdmin().from(body.resource).update(data).eq('id', id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Mise à jour administration impossible :', error)
    return NextResponse.json({ error: 'Impossible de mettre à jour la donnée.' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const denied = await requireAdmin()
  if (denied) return denied

  try {
    const url = new URL(request.url)
    const resource = url.searchParams.get('resource')
    const id = Number(url.searchParams.get('id'))
    if (!isResource(resource) || !Number.isSafeInteger(id) || id < 1) {
      return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 })
    }

    const { error } = await getSupabaseAdmin().from(resource).delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Suppression administration impossible :', error)
    return NextResponse.json({ error: 'Impossible de supprimer la donnée.' }, { status: 500 })
  }
}
