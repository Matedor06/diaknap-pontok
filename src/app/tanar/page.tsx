"use client";
import React, { useState } from 'react';

const STATION_PINS: Record<string, string> = {
  '1001': '1. Állomás (Tornaterem)',
  '1002': '2. Állomás (Udvar)',
  '1003': '3. Állomás (Kémia labor)',
  '1004': '4. Állomás',
  '1005': '5. Állomás',
  '1006': '6. Állomás',
  '1007': '7. Állomás',
  '1008': '8. Állomás',
  '1009': '9. Állomás',
  '1010': '10. Állomás',
  '1011': '11. Állomás',
  '1012': '12. Állomás',
  '1013': '13. Állomás',
  '1014': '14. Állomás',
  '1015': '15. Állomás',
};

const ADMIN_PIN = 'admin123'; // Admin jelszó: ezzel lehet törölni

export default function TanarPage() {
  const [pin, setPin] = useState('');
  const [loggedInStation, setLoggedInStation] = useState<string | null>(null);
  
  const [osztaly, setOsztaly] = useState('9.A');
  const [pont, setPont] = useState(10);
  const [uzenet, setUzenet] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (STATION_PINS[pin]) {
      setLoggedInStation(STATION_PINS[pin]);
    } else if (pin === ADMIN_PIN) {
      setLoggedInStation('ADMIN');
    } else {
      alert('Helytelen jelszó vagy PIN kód!');
      setPin('');
    }
  };

  const handleClearAll = async () => {
    if (!confirm('BIZTOSAN TÖRLÖD AZ ÖSSZES PONTOT A FELHŐBŐL? Ezt nem lehet visszavonni!')) return;
    
    // Dupla védelem
    if (!confirm('Tényleg biztos? A törlés után 0 pontja lesz minden osztálynak.')) return;

    const res = await fetch('/api/points', { method: 'DELETE' });
    if(res.ok) {
      alert('Minden adat sikeresen törölve! Tiszta lappal indultok.');
    } else {
      alert('Hiba történt a törlés során!');
    }
  };

  const submitPont = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggedInStation || loggedInStation === 'ADMIN') return;
    
    const helyszin = loggedInStation; // Az állomás neve a bejelentkezésből

    const res = await fetch('/api/points', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ helyszin, osztaly, pont }),
    });
    
    // Hibakeresés kliens oldalon, ha megint 500-ast dob:
    if(!res.ok) {
      const errorData = await res.json();
      alert(`Szerver hiba: ${errorData.error || 'Ismeretlen hiba'}`);
      return;
    }

    if(res.ok) {
        setUzenet(`Sikeresen mentve: ${pont} pont a ${osztaly} osztálynak!`);
        setPont(10); // reset pont
    }
    setTimeout(() => setUzenet(''), 3000);
  };

  // 1. BEJELENTKEZŐ / JELSZÓ KÉPERNYŐ
  if (!loggedInStation) {
    return (
      <main className="p-4 sm:p-8 max-w-md mx-auto mt-8 sm:mt-12">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Tanári Belépés</h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-4 bg-zinc-800 p-6 sm:p-8 rounded-xl shadow-lg border border-gray-700">
          <label className="font-bold text-gray-200">Állomás jelszava (PIN kód):</label>
          <input 
            type="password" 
            value={pin} 
            onChange={(e: any) => setPin(e.target.value)} 
            placeholder="****"
            className="p-3 border rounded text-black font-bold text-center text-2xl tracking-widest outline-none focus:ring-4 ring-blue-500" 
            autoFocus
          />
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 transition-colors text-white font-bold p-4 rounded-lg mt-4 shadow-lg shadow-blue-500/30">
            BELÉPÉS
          </button>
        </form>
      </main>
    );
  }

  // 2. ADMINISZTRÁTORI KÉPERNYŐ (Minden törlése)
  if (loggedInStation === 'ADMIN') {
    return (
      <main className="p-4 sm:p-8 max-w-md mx-auto mt-8 sm:mt-12 text-center flex flex-col gap-6 items-center">
        <div className="bg-red-900/20 p-6 sm:p-8 rounded-xl border border-red-500">
          <h1 className="text-2xl sm:text-3xl font-black text-red-500 mb-2">VESZÉLYZÓNA</h1>
          <p className="text-gray-300 mb-8">Ezen a felületen tudod véglegesen kitörölni a tesztelés alatt beírt pontokat. Csak a diáknap reggelén használd!</p>
          
          <button onClick={handleClearAll} className="bg-red-600 hover:bg-red-700 text-white p-5 font-bold rounded-lg shadow-xl shadow-red-600/50 w-full text-lg transition-transform active:scale-95">
            MINDEN PONT TÖRLÉSE
          </button>
        </div>
        <button onClick={() => { setLoggedInStation(null); setPin(''); }} className="text-gray-400 mt-4 hover:text-white underline">
          ← Kijelentkezés
        </button>
      </main>
    );
  }

  // 3. SIKERES BEJELENTKEZÉS UTÁNI PONTOZÓ
  return (
    <main className="p-4 sm:p-8 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-6 bg-zinc-900 p-4 rounded-lg border border-gray-700">
        <h1 className="text-lg font-bold text-blue-400">{loggedInStation}</h1>
        <button onClick={() => { setLoggedInStation(null); setPin(''); }} className="text-sm bg-gray-700 hover:bg-red-600 transition-colors px-3 py-2 rounded font-bold text-white">
          Kilépés
        </button>
      </div>

      <form onSubmit={submitPont} className="flex flex-col gap-4 bg-zinc-800 p-4 sm:p-6 rounded-xl shadow-lg border border-gray-700">
        <label className="font-bold text-gray-200">Melyik osztály pontozod?</label>
        <select value={osztaly} onChange={(e) => setOsztaly(e.target.value)} className="p-3 sm:p-4 border border-gray-600 rounded-lg text-black bg-white font-bold text-lg sm:text-xl outline-none focus:ring-4 ring-blue-500 cursor-pointer">
          {['9.A', '9.B', '10.A', '10.B', '11.A', '11.B', '12.A', '12.B'].map(o => <option key={o}>{o}</option>)}
        </select>

        <label className="font-bold text-gray-200 mt-2 sm:mt-4">Kiosztott pont (0-10):</label>
        <div className="flex items-center gap-2 sm:gap-4">
          <button type="button" onClick={() => setPont(p => Math.max(0, p - 1))} className="bg-gray-600 w-12 h-12 sm:w-14 sm:h-14 rounded-full text-2xl font-bold hover:bg-gray-500">-</button>
          <input type="number" min="0" max="10" value={pont} onChange={(e) => setPont(Number(e.target.value))} className="flex-1 p-2 border border-gray-600 rounded-lg text-black bg-white text-4xl sm:text-5xl text-center font-black outline-none focus:ring-4 ring-blue-500" />
          <button type="button" onClick={() => setPont(p => Math.min(10, p + 1))} className="bg-gray-600 w-12 h-12 sm:w-14 sm:h-14 rounded-full text-2xl font-bold hover:bg-gray-500">+</button>
        </div>

        <button type="submit" className="bg-blue-600 hover:bg-blue-500 transition-colors text-white font-bold p-4 sm:p-5 rounded-lg mt-4 sm:mt-6 text-lg sm:text-xl shadow-lg shadow-blue-500/30 active:scale-95">
          {pont} PONT MENTÉSE
        </button>
      </form>
      
      {uzenet && (
        <div className="mt-6 p-4 border-l-4 border-green-500 bg-green-900/30 text-green-400 font-bold rounded shadow-lg text-center animate-pulse">
          {uzenet}
        </div>
      )}
    </main>
  );
}
