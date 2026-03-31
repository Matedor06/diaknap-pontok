"use client";
import React, { useState } from 'react';

export default function TanarPage() {
  const [helyszin, setHelyszin] = useState('1. Állomás');
  const [osztaly, setOsztaly] = useState('9.A');
  const [pont, setPont] = useState(10);
  const [uzenet, setUzenet] = useState('');

  const submitPont = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/points', {
      method: 'POST',
      body: JSON.stringify({ helyszin, osztaly, pont }),
    });
    if(res.ok) {
        setUzenet('Sikeresen mentve: ' + pont + ' pont a ' + osztaly + ' osztálynak!');
        setPont(10); // reset
    }
    setTimeout(() => setUzenet(''), 3000);
  };

  return (
    <main className="p-8 max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Tudósító (Tanári Felület)</h1>
      <form onSubmit={submitPont} className="flex flex-col gap-4 bg-zinc-800 p-6 rounded-xl shadow-lg">
        
        <label className="font-bold">Helyszín:</label>
        <select value={helyszin} onChange={(e) => setHelyszin(e.target.value)} className="p-3 border rounded text-black bg-white">
          {Array.from({length: 15}, (_, i) => <option key={i}>{i+1}. Állomás</option>)}
        </select>

        <label className="font-bold">Osztály:</label>
        <select value={osztaly} onChange={(e) => setOsztaly(e.target.value)} className="p-3 border rounded text-black bg-white">
          {['9.A', '9.B', '10.A', '10.B', '11.A', '11.B', '12.A', '12.B'].map(o => <option key={o}>{o}</option>)}
        </select>

        <label className="font-bold">Szerezhető pont (0-10):</label>
        <input type="number" min="0" max="10" value={pont} onChange={(e) => setPont(Number(e.target.value))} className="p-3 border rounded text-black bg-white text-xl text-center font-bold" />

        <button type="submit" className="bg-blue-600 hover:bg-blue-700 transition-colors text-white font-bold p-4 rounded-lg mt-4">
          PONTOK ELKÜLDÉSE
        </button>
      </form>
      
      {uzenet && <div className="mt-6 p-4 bg-green-500 text-white font-bold rounded-lg text-center animate-bounce">{uzenet}</div>}
    </main>
  );
}
