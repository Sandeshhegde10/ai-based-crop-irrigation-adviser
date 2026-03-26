import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  
  try {
    const { message, gardenId } = await req.json()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Save chat message to database
    const { data, error } = await supabase
      .from('chat_history')
      .insert([
        {
          user_id: user.id,
          garden_id: gardenId || null,
          user_message: message,
          ai_response: 'Processing your irrigation question...',
        }
      ])
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // TODO: Integrate with AI SDK for actual responses
    // For now, return placeholder response
    const aiResponse = `Based on your question about irrigation, I recommend:
1. Check soil moisture levels before watering
2. Water during early morning or late evening to reduce evaporation
3. Adjust irrigation based on current weather conditions
4. Consider the specific water needs of your crops`

    // Update chat message with AI response
    const { data: updated } = await supabase
      .from('chat_history')
      .update({ ai_response: aiResponse })
      .eq('id', data?.[0]?.id)
      .select()

    return NextResponse.json(updated?.[0])
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
      .from('chat_history')
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
