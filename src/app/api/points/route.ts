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
  
  // 1. Megnézzük, van-e már rögzítve pont ennek az osztálynak, ezen a helyszínen
  const { data: existingData } = await supabase
    .from('points')
    .select('id')
    .eq('osztaly', body.osztaly)
    .eq('helyszin', body.helyszin)
    .single();

  if (existingData) {
    // 2. HA VAN: Akkor UPDATE (Felülírás)
    const { error } = await supabase
      .from('points')
      .update({ pont: Number(body.pont) })
      .eq('id', existingData.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, message: 'Rögzített pontszám sikeresen felülírva!' });

  } else {
    // 3. HA NINCS Még: Akkor INSERT (Új sor létrehozása)
    const { error } = await supabase.from('points').insert([
      {
        helyszin: body.helyszin,
        osztaly: body.osztaly,
        pont: Number(body.pont)
      }
    ]);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, message: 'Új pontszám sikeresen rögzítve!' });
  }
}

export async function DELETE() {
  // A Supabase törléshez kell egy szűrő. Ezzel a trükkel az összes meglévő adatot kijelöljük és töröljük.
  const { error } = await supabase.from('points').delete().neq('osztaly', 'NINCS_ILYEN_OSZTALY');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: 'Minden adat törölve a felhőből!' });
}
