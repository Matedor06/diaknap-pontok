import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Kapcsolódás a Supabase felhőhöz
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  const { data, error } = await supabase.from('points').select('*');
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data || []);
}

export async function POST(request: Request) {
  const body = await request.json();
  
  const { error } = await supabase.from('points').insert([
    {
      helyszin: body.helyszin,
      osztaly: body.osztaly,
      pont: Number(body.pont)
    }
  ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: 'Pont felhőbe mentve!' });
}

export async function DELETE() {
  // A Supabase törléshez kell egy szűrő. Ezzel a trükkel az összes meglévő adatot kijelöljük és töröljük.
  const { error } = await supabase.from('points').delete().neq('osztaly', 'NINCS_ILYEN_OSZTALY');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: 'Minden adat törölve a felhőből!' });
}
