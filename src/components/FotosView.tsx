import React, { useState } from "react";
import { Camera, Plus, X, Heart, MapPin } from "lucide-react";
import { PhotoItem } from "../types";

interface FotosViewProps {
  photos: PhotoItem[];
  onAddPhoto: (photo: PhotoItem) => void;
}

export const FotosView: React.FC<FotosViewProps> = ({ photos, onAddPhoto }) => {
  const [selectedAlbum, setSelectedAlbum] = useState<string>("alle");
  const [lightboxPhoto, setLightboxPhoto] = useState<PhotoItem | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Upload Form State
  const [caption, setCaption] = useState("");
  const [url, setUrl] = useState("");
  const [albumName, setAlbumName] = useState("Noosa & East Coast");
  const [land, setLand] = useState("Australië");
  const [plaats, setPlaats] = useState("Noosa Heads");

  const albums = Array.from(new Set(photos.map((p) => p.albumName)));

  const filtered =
    selectedAlbum === "alle"
      ? photos
      : photos.filter((p) => p.albumName === selectedAlbum);

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption || !url) return;
    const newP: PhotoItem = {
      id: "photo-" + Date.now(),
      url,
      caption,
      datum: new Date().toLocaleDateString("nl-NL"),
      land,
      plaats,
      activiteit: "Reisfoto",
      albumName,
      gps: { lat: -26.39, lng: 153.09 },
    };
    onAddPhoto(newP);
    setCaption("");
    setUrl("");
    setShowUploadModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#39B8C8]" />
            Foto's & Reisalbum
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Alle dierbare herinneringen van het gezin op een rij per land en etappe.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#174A7E] hover:bg-[#1d5c9c] text-white font-bold text-xs rounded-xl shadow-xs transition"
        >
          <Plus className="w-4 h-4 text-[#39B8C8]" /> Foto Toevoegen
        </button>
      </div>

      {/* Album Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedAlbum("alle")}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition shrink-0 ${
            selectedAlbum === "alle"
              ? "bg-[#174A7E] text-white shadow-md border border-[#39B8C8]"
              : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
          }`}
        >
          Alle Foto's ({photos.length})
        </button>
        {albums.map((alb) => (
          <button
            key={alb}
            onClick={() => setSelectedAlbum(alb)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition shrink-0 ${
              selectedAlbum === alb
                ? "bg-[#174A7E] text-white shadow-md border border-[#39B8C8]"
                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
            }`}
          >
            {alb}
          </button>
        ))}
      </div>

      {/* Photo Gallery Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((photo) => (
          <div
            key={photo.id}
            onClick={() => setLightboxPhoto(photo)}
            className="group relative rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-xl transition cursor-pointer"
          >
            <img
              src={photo.url}
              alt={photo.caption}
              className="w-full h-48 sm:h-56 object-cover group-hover:scale-105 transition duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition p-4 flex flex-col justify-end text-white">
              <span className="text-[10px] font-bold text-[#39B8C8] uppercase">
                {photo.albumName}
              </span>
              <p className="font-bold text-xs truncate">{photo.caption}</p>
              <span className="text-[10px] opacity-80 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-[#39B8C8]" /> {photo.land} • {photo.datum}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {lightboxPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
          <div className="w-full max-w-3xl bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="relative">
              <img
                src={lightboxPhoto.url}
                alt={lightboxPhoto.caption}
                className="w-full max-h-[70vh] object-contain bg-black"
              />
              <button
                onClick={() => setLightboxPhoto(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 text-white flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#39B8C8] uppercase">
                  {lightboxPhoto.albumName} • {lightboxPhoto.land}
                </span>
                <h3 className="text-lg font-bold">{lightboxPhoto.caption}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{lightboxPhoto.datum}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Foto Toevoegen aan Reisalbum
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Omschrijving / Titel *"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700"
                required
              />
              <input
                type="url"
                placeholder="Afbeelding URL (bijv. Unsplash of foto-link) *"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700"
                required
              />
              <input
                type="text"
                placeholder="Album (bijv. Noosa & East Coast)"
                value={albumName}
                onChange={(e) => setAlbumName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700"
              />
              <input
                type="text"
                placeholder="Land (bijv. Australië)"
                value={land}
                onChange={(e) => setLand(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500"
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#39B8C8] text-[#174A7E] font-bold text-xs rounded-xl"
                >
                  Opslaan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
