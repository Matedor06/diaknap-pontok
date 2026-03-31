"use client";
import React, { useEffect, useState } from "react";

export default function Home() {
  const [points, setPoints] = useState<any[]>([]);

  const fetchPoints = () => {
    fetch("/api/points")
      .then((res) => res.json())
      .then((data) => setPoints(data));
  };

  useEffect(() => {
    fetchPoints();
    const interval = setInterval(fetchPoints, 5000); // 5 mp-ként frissít
    return () => clearInterval(interval);
  }, []);

  // Osztályonkénti összegzés
  const leaderboard = points.reduce((acc: any, curr: any) => {
    acc[curr.osztaly] = (acc[curr.osztaly] || 0) + Number(curr.pont);
    return acc;
  }, {});

  const sortedLeaderboard = Object.entries(leaderboard).sort(
    (a: any, b: any) => b[1] - a[1]
  );

  // Állomásonkénti bontás
  const stations = points.reduce((acc: any, curr: any) => {
    if (!acc[curr.helyszin]) {
      acc[curr.helyszin] = [];
    }
    acc[curr.helyszin].push({ osztaly: curr.osztaly, pont: Number(curr.pont) });
    return acc;
  }, {});

  // Állomások rendezése név (vagy szám) szerint
  const sortedStations = Object.keys(stations).sort();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 p-8 font-sans">
      <main className="max-w-5xl mx-auto flex flex-col gap-12">
        
        {/* Fő Címsor */}
        <header className="text-center space-y-4">
          <h1 className="text-5xl font-extrabold tracking-tight text-blue-600 dark:text-blue-400">
            Diáknap Eredmények
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Élő pontozás és állomásonkénti részletek
          </p>
        </header>

        {/* Eredménytábla (Összesített) */}
        <section>
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <span>Összesített Ranglista</span>
          </h2>
          <div className="bg-white dark:bg-zinc-800 shadow-xl rounded-2xl p-6 md:p-8">
            {sortedLeaderboard.length === 0 ? (
              <p className="text-center text-zinc-500 dark:text-zinc-400 italic py-8">
                Még nincs regisztrált pont...
              </p>
            ) : (
              <ul className="flex flex-col gap-4">
                {sortedLeaderboard.map(([osztaly, pont], i) => (
                  <li
                    key={osztaly}
                    className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-700 pb-4 last:border-0 last:pb-0 text-xl md:text-2xl"
                  >
                    <span className="flex items-center gap-4">
                      <span className={`font-bold w-10 h-10 flex items-center justify-center rounded-full ${
                        i === 0 ? "bg-yellow-400 text-yellow-900" :
                        i === 1 ? "bg-gray-300 text-gray-800" :
                        i === 2 ? "bg-amber-600 text-white" :
                        "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
                      }`}>
                        {i + 1}
                      </span>
                      <span className="font-semibold">{osztaly}</span>
                    </span>
                    <span className="font-black text-blue-600 dark:text-blue-400">
                      {String(pont)} <span className="text-sm font-normal text-zinc-500">pont</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Állomásonkénti részletek */}
        <section>
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <span>Állomásonkénti Pontok</span>
          </h2>
          {sortedStations.length === 0 ? (
            <p className="text-zinc-500 dark:text-zinc-400 italic">Még nincsenek adatok az állomásokhoz.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedStations.map((stationName) => {
                const classPoints = stations[stationName];
                // Maximum pont az állomáson a vizuális sávokhoz
                const maxPont = Math.max(...classPoints.map((c: any) => c.pont), 10);

                return (
                  <div key={stationName} className="bg-white dark:bg-zinc-800 shadow-lg rounded-2xl p-6 border border-zinc-200 dark:border-zinc-700 flex flex-col">
                    <h3 className="text-xl font-bold mb-4 text-zinc-800 dark:text-zinc-200 border-b border-zinc-100 dark:border-zinc-700 pb-2">
                      {stationName}
                    </h3>
                    <ul className="flex flex-col gap-3 mt-2 flex-grow">
                      {classPoints
                        .sort((a: any, b: any) => b.pont - a.pont)
                        .map((cp: any, idx: number) => (
                        <li key={`${idx}-${cp.osztaly}`} className="flex flex-col gap-1">
                          <div className="flex justify-between items-end text-sm">
                            <span className="font-semibold">{cp.osztaly}</span>
                            <span className="font-bold text-blue-600 dark:text-blue-400">{cp.pont} p</span>
                          </div>
                          <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2.5">
                            <div
                              className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full"
                              style={{ width: `${(cp.pont / maxPont) * 100}%` }}
                            ></div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
