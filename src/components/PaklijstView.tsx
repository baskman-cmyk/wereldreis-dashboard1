import React, { useMemo, useState } from "react";
import {
  PackageCheck,
  Plus,
  Search,
  Check,
  ShoppingCart,
  Backpack,
  Luggage,
  Caravan,
  Shirt,
  Laptop,
  HeartPulse,
  FileText,
  Baby,
  TentTree,
  Sparkles,
  Users,
} from "lucide-react";
import { PackingItem } from "../types";

interface PaklijstViewProps {
  items: PackingItem[];
  onAddItem: (item: PackingItem) => void;
  onUpdateStatus: (id: string, status: PackingItem["status"]) => void;
}

const statuses: Array<{
  value: PackingItem["status"];
  label: string;
  icon: React.ElementType;
}> = [
  { value: "Nog kopen", label: "Nog kopen", icon: ShoppingCart },
  { value: "Inpakken", label: "Klaarleggen", icon: Backpack },
  { value: "In koffer", label: "In koffer", icon: Luggage },
  { value: "In camper", label: "In camper", icon: Caravan },
];

const categoryIcons: Record<PackingItem["categorie"], React.ElementType> = {
  Kleding: Shirt,
  Kamperen: TentTree,
  Elektronica: Laptop,
  EHBO: HeartPulse,
  Kinderen: Baby,
  Documenten: FileText,
  Toiletartikelen: Sparkles,
  Favorieten: PackageCheck,
};

const isPacked = (status: PackingItem["status"]) =>
  status === "In koffer" || status === "In camper";

export const PaklijstView: React.FC<PaklijstViewProps> = ({
  items,
  onAddItem,
  onUpdateStatus,
}) => {
  const [selectedPerson, setSelectedPerson] = useState("alle");
  const [selectedCategory, setSelectedCategory] = useState("alle");
  const [selectedStatus, setSelectedStatus] = useState("alle");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const [itemText, setItemText] = useState("");
  const [categorie, setCategorie] = useState<PackingItem["categorie"]>("Kleding");
  const [toegewezenAan, setToegewezenAan] = useState("Gezin");
  const [newStatus, setNewStatus] = useState<PackingItem["status"]>("Inpakken");

  const persons = useMemo(
    () => ["alle", ...Array.from(new Set(items.map((item) => item.toegewezenAan)))],
    [items]
  );
  const categories = useMemo(
    () => ["alle", ...Array.from(new Set(items.map((item) => item.categorie)))],
    [items]
  );

  const filtered = useMemo(
    () =>
      items.filter((item) => {
        const matchesPerson = selectedPerson === "alle" || item.toegewezenAan === selectedPerson;
        const matchesCategory = selectedCategory === "alle" || item.categorie === selectedCategory;
        const matchesStatus = selectedStatus === "alle" || item.status === selectedStatus;
        const query = searchQuery.trim().toLowerCase();
        const matchesQuery =
          !query ||
          item.item.toLowerCase().includes(query) ||
          item.toegewezenAan.toLowerCase().includes(query) ||
          item.categorie.toLowerCase().includes(query);
        return matchesPerson && matchesCategory && matchesStatus && matchesQuery;
      }),
    [items, searchQuery, selectedCategory, selectedPerson, selectedStatus]
  );

  const packedCount = items.filter((item) => isPacked(item.status)).length;
  const toBuyCount = items.filter((item) => item.status === "Nog kopen").length;
  const readyCount = items.filter((item) => item.status === "Inpakken").length;
  const progressPercent = items.length ? Math.round((packedCount / items.length) * 100) : 0;

  const personProgress = useMemo(
    () =>
      persons
        .filter((person) => person !== "alle")
        .map((person) => {
          const personItems = items.filter((item) => item.toegewezenAan === person);
          const done = personItems.filter((item) => isPacked(item.status)).length;
          return {
            person,
            done,
            total: personItems.length,
            percentage: personItems.length ? Math.round((done / personItems.length) * 100) : 0,
          };
        }),
    [items, persons]
  );

  const handleAddSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!itemText.trim()) return;
    onAddItem({
      id: `pack-${Date.now()}`,
      item: itemText.trim(),
      categorie,
      toegewezenAan,
      status: newStatus,
    });
    setItemText("");
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#174A7E] via-[#1d5c9c] to-[#23729b] p-6 text-white shadow-lg">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#9ee8ef]">Voorbereiding</p>
            <h2 className="flex items-center gap-3 text-2xl font-black">
              <PackageCheck className="h-7 w-7 text-[#56d2df]" />
              Paklijst & bagage
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-blue-100">
              Houd per persoon bij wat nog gekocht, klaargelegd of al opgeborgen is.
            </p>
          </div>
          <button
            onClick={() => setShowAddForm((value) => !value)}
            className="flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-black text-[#174A7E] shadow-sm transition hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4" /> Nieuw item
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            ["Ingepakt", packedCount, Check],
            ["Klaarleggen", readyCount, Backpack],
            ["Nog kopen", toBuyCount, ShoppingCart],
            ["Totaal", items.length, PackageCheck],
          ].map(([label, value, Icon]) => (
            <div key={String(label)} className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <Icon className="mb-3 h-5 w-5 text-[#78e0ea]" />
              <div className="text-2xl font-black">{String(value)}</div>
              <div className="text-xs font-semibold text-blue-100">{String(label)}</div>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-xs font-bold">
            <span>Totale voortgang</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-[#56d2df] transition-all" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </section>

      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="grid grid-cols-1 gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:grid-cols-2 xl:grid-cols-5">
          <input
            value={itemText}
            onChange={(event) => setItemText(event.target.value)}
            placeholder="Wat moet mee?"
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-800 xl:col-span-2"
            required
          />
          <select value={categorie} onChange={(event) => setCategorie(event.target.value as PackingItem["categorie"])} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-800">
            {Object.keys(categoryIcons).map((category) => <option key={category}>{category}</option>)}
          </select>
          <select value={toegewezenAan} onChange={(event) => setToegewezenAan(event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-800">
            {persons.filter((person) => person !== "alle").map((person) => <option key={person}>{person}</option>)}
          </select>
          <select value={newStatus} onChange={(event) => setNewStatus(event.target.value as PackingItem["status"])} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-800">
            {statuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
          </select>
          <button type="submit" className="rounded-xl bg-[#174A7E] px-4 py-3 text-sm font-black text-white md:col-span-2 xl:col-span-5">Opslaan</button>
        </form>
      )}

      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-[#39B8C8]" />
            <h3 className="font-black text-slate-900 dark:text-white">Voortgang per persoon</h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {personProgress.map((entry) => (
              <button key={entry.person} onClick={() => setSelectedPerson(entry.person)} className="rounded-2xl bg-slate-50 p-4 text-left transition hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-black text-slate-800 dark:text-white">{entry.person}</span>
                  <span className="text-xs font-bold text-slate-500">{entry.done}/{entry.total}</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <div className="h-full rounded-full bg-[#39B8C8]" style={{ width: `${entry.percentage}%` }} />
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/50 dark:bg-amber-950/20">
          <h3 className="font-black text-amber-950 dark:text-amber-100">Eerst regelen</h3>
          <p className="mt-1 text-xs text-amber-800 dark:text-amber-300">Deze spullen blokkeren het inpakken nog.</p>
          <div className="mt-4 space-y-2">
            {items.filter((item) => item.status === "Nog kopen").slice(0, 5).map((item) => (
              <button key={item.id} onClick={() => onUpdateStatus(item.id, "Inpakken")} className="flex w-full items-center justify-between rounded-xl bg-white/80 p-3 text-left dark:bg-slate-900/60">
                <span className="text-xs font-bold text-slate-800 dark:text-white">{item.item}</span>
                <ShoppingCart className="h-4 w-4 text-amber-600" />
              </button>
            ))}
            {!toBuyCount && <p className="rounded-xl bg-white/70 p-3 text-xs font-semibold text-emerald-700">Alles is gekocht.</p>}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Zoek item, persoon of categorie" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-800" />
          </div>
          <select value={selectedPerson} onChange={(event) => setSelectedPerson(event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800">
            {persons.map((person) => <option key={person} value={person}>{person === "alle" ? "Iedereen" : person}</option>)}
          </select>
          <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800">
            {categories.map((category) => <option key={category} value={category}>{category === "alle" ? "Alle categorieën" : category}</option>)}
          </select>
          <select value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800">
            <option value="alle">Alle statussen</option>
            {statuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
          </select>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((item) => {
          const CategoryIcon = categoryIcons[item.categorie];
          const statusInfo = statuses.find((status) => status.value === item.status) ?? statuses[1];
          const StatusIcon = statusInfo.icon;
          return (
            <article key={item.id} className={`rounded-2xl border p-4 transition ${isPacked(item.status) ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/20" : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"}`}>
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-slate-100 p-2.5 text-[#174A7E] dark:bg-slate-800 dark:text-[#56d2df]"><CategoryIcon className="h-5 w-5" /></div>
                <div className="min-w-0 flex-1">
                  <h4 className={`text-sm font-black text-slate-900 dark:text-white ${isPacked(item.status) ? "line-through opacity-70" : ""}`}>{item.item}</h4>
                  <p className="mt-1 text-[11px] font-semibold text-slate-500">{item.categorie} · {item.toegewezenAan}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <StatusIcon className="h-4 w-4 text-slate-500" />
                <select value={item.status} onChange={(event) => onUpdateStatus(item.id, event.target.value as PackingItem["status"])} className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-800">
                  {statuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
                </select>
              </div>
            </article>
          );
        })}
      </section>

      {!filtered.length && <div className="rounded-3xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-slate-700">Geen items gevonden met deze filters.</div>}
    </div>
  );
};
