import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { gardenId, cropType, frequency, waterAmount, startDate, notes } = await req.json()

    const { data, error } = await supabase
      .from('schedules')
      .insert([
        {
          user_id: user.id,
          garden_id: gardenId,
          crop_type: cropType,
          frequency,
          water_amount: waterAmount,
          start_date: startDate,
          notes,
        }
      ])
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data?.[0])
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  const supabase = await createServerClient()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const gardenId = req.nextUrl.searchParams.get('gardenId')

    let query = supabase
      .from('schedules')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (gardenId) {
      query = query.eq('garden_id', gardenId)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
