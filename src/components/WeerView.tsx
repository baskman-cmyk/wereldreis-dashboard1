import React, { useState } from "react";
import { CloudSun, Sun, MapPin } from "lucide-react";
import { WeatherInfo } from "../types";

interface WeerViewProps {
  weatherData: WeatherInfo;
}

export const WeerView: React.FC<WeerViewProps> = ({ weatherData }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CloudSun className="w-5 h-5 text-[#39B8C8]" />
            Weersverwachting op Huidige Locatie
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Actueel weer en 14-daagse weersvoorspelling.
          </p>
        </div>
      </div>

      {/* Current Selected Weather Card */}
      <div className="bg-gradient-to-br from-[#174A7E] to-[#123962] text-white p-6 rounded-3xl shadow-xl border border-[#39B8C8]/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-xs text-[#F3E7C8] uppercase font-bold tracking-wider flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> Noosa Heads, Australië
            </span>
            <div className="flex items-baseline gap-4 mt-2">
              <span className="text-5xl sm:text-6xl font-black">
                {weatherData.currentTemp}°C
              </span>
              <span className="text-lg text-[#F3E7C8] font-medium">
                {weatherData.condition}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 bg-white/10 p-4 rounded-2xl border border-white/20 text-xs">
            <div>
              <span className="text-[10px] text-[#F3E7C8] block font-bold">UV-Index</span>
              <span className="text-base font-black">{weatherData.uvIndex}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#F3E7C8] block font-bold">Regenkans</span>
              <span className="text-base font-black">{weatherData.rainChance}%</span>
            </div>
            <div>
              <span className="text-[10px] text-[#F3E7C8] block font-bold">Wind</span>
              <span className="text-base font-black">{weatherData.windKmh} km/h</span>
            </div>
          </div>
        </div>

        {/* 14-Day Forecast Grid */}
        <div className="mt-8 pt-6 border-t border-white/15">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#F3E7C8] mb-4">
            14-Daagse Voorspelling
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
            {weatherData.forecast14Days.map((f, i) => (
              <div
                key={i}
                className="p-3 bg-white/10 rounded-2xl border border-white/15 text-center flex flex-col items-center justify-between"
              >
                <span className="text-[11px] font-bold text-[#F3E7C8]">{f.dayName}</span>
                <Sun className="w-6 h-6 text-amber-300 my-2" />
                <span className="text-sm font-black text-white">{f.tempMax}°C</span>
                <span className="text-[10px] text-[#F3E7C8] mt-1">{f.condition}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
