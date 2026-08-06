export type TabType =
  | "today"
  | "dashboard"
  | "timeline"
  | "reisplanning"
  | "navigatie"
  | "vluchten"
  | "accommodaties"
  | "camper"
  | "budget"
  | "documenten"
  | "gezondheid"
  | "paklijst"
  | "fotos"
  | "dagboek"
  | "kaarten"
  | "activiteiten"
  | "checklist"
  | "meldingen"
  | "weer"
  | "valuta"
  | "nood"
  | "statistieken"
  | "assistant"
  | "more";

export interface GPSLocation {
  lat: number;
  lng: number;
  label?: string;
}

export interface DayForecast {
  date: string;
  dayName: string;
  tempMax: number;
  tempMin: number;
  condition: "Zonnig" | "Gedeeltelijk bewolkt" | "Lichte regen" | "Onweer" | "Bewolkt";
  icon: string;
  uvIndex: number;
  rainChance: number;
}

export interface WeatherInfo {
  currentTemp: number;
  condition: string;
  humidity: number;
  windKmh: number;
  uvIndex: number;
  rainChance: number;
  sunrise: string;
  sunset: string;
  forecast14Days: DayForecast[];
}

export interface NextFlightInfo {
  flightNumber: string;
  airline: string;
  fromCode: string;
  toCode: string;
  departureTime: string;
  gate: string;
  seat: string;
  countdownText: string;
}

export interface TripOverview {
  title: string;
  familyTitle: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  currentDay: number;
  currentCountry: string;
  currentCity: string;
  currentGps: GPSLocation;
  visitedCountriesCount: number;
  totalKmTraveled: number;
  totalHikeKm: number;
  photosCount: number;
  videosCount: number;
  nextFlight: NextFlightInfo;
  weather: WeatherInfo;
  timezoneDiffHours: number; // e.g., +10 relative to NL
  currencies: {
    [code: string]: number; // EUR to target, e.g. SGD: 1.45, AUD: 1.65, NZD: 1.80, USD: 1.09, IDR: 17200
  };
}

export interface ExpenseItem {
  id: string;
  date: string;
  category:
    | "eten"
    | "boodschappen"
    | "vluchten"
    | "vervoer"
    | "brandstof"
    | "tol"
    | "parkeren"
    | "campings"
    | "hotels"
    | "activiteiten"
    | "verzekeringen"
    | "visa"
    | "internet"
    | "kleding"
    | "souvenirs"
    | "thuis"
    | "onvoorzien"
    | "overig";
  description: string;
  amountOriginal: number;
  currency: string;
  amountEur: number;
  country: string;
  paidBy: string;
}

export interface TimelineDay {
  id: string;
  dayNumber: number;
  date: string;
  land: string;
  plaats: string;
  overnachting: string;
  activiteiten: string[];
  fotos: string[];
  notities: string;
  uitgaven: ExpenseItem[];
  gps: GPSLocation;
  samenvatting?: string;
  isCompleted: boolean;
}

export interface CountryPlan {
  id: string;
  land: string;
  flag: string;
  startDate: string;
  endDate: string;
  routeDescription: string;
  mapCoordinates: GPSLocation;
  highlightCities: string[];
}

export interface SavedLocation {
  id: string;
  naam: string;
  adres: string;
  website?: string;
  openingstijden?: string;
  telefoon?: string;
  gps: GPSLocation;
  kostenEur?: number;
  reserveringsnummer?: string;
  notities: string;
  rating: number; // 1 to 5
  category: "restaurant" | "supermarket" | "sight" | "camping" | "repair" | "other";
}


export interface StoredPdf {
  name: string;
  size: number;
  type: "application/pdf";
  dataUrl: string;
  uploadedAt: string;
}

export interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  fromCity: string;
  fromCode: string;
  toCity: string;
  toCode: string;
  departureTime: string;
  arrivalTime: string;
  departureDate: string;
  terminal: string;
  gate: string;
  seat: string;
  baggage: string;
  boardingPassPdfUrl?: string;
  eTicketPdf?: StoredPdf;
  qrCodeText: string;
  status: "Op tijd" | "Vertraagd" | "Boarding" | "Geland";
  delayMinutes: number;
}

export interface Accommodation {
  id: string;
  name: string;
  foto: string;
  adres: string;
  telefoon: string;
  email: string;
  checkIn: string;
  checkOut: string;
  prijsEur: number;
  boekingsnummer: string;
  mapsUrl: string;
  wifiCode: string;
  bijzonderheden: string;
  land: string;
  stad: string;
  bookingPdf?: StoredPdf;
}

export interface FuelRefill {
  id: string;
  date: string;
  km: number;
  liters: number;
  priceEur: number;
  location: string;
}

export interface MaintenanceLog {
  id: string;
  date: string;
  type: string;
  costEur: number;
  status: "In behandeling" | "Voltooid";
  notes: string;
}

export interface DamageLog {
  id: string;
  date: string;
  description: string;
  photoUrl?: string;
  status: "Gemeld" | "Gerepareerd" | "Verzekeringsclaim";
}

export interface InventoryItem {
  id: string;
  item: string;
  quantity: number;
  status: "ok" | "missing" | "damaged";
  category: "Keuken" | "Slaapspullen" | "Buiten" | "Veiligheid";
}

export interface CarRentalDetails {
  modelName: string;
  category: string;
  company: string;
  ophaallocatie: string;
  inleverlocatie: string;
  ophaaldatum: string;
  inleverdatum: string;
  dagprijsEur: number;
  brandstofverbruikLPer100Km: number;
  verzekeringInfo: string;
  kenteken?: string;
  tolpasInbegrepen: boolean;
  kinderzitjesInbegrepen: boolean;
  hotelBudgetPerNachtEur: number;
  rentalContractPdf?: StoredPdf;
  insurancePdf?: StoredPdf;
}

export interface BudgetDashboardLine {
  label: string;
  amountEur: number;
  source: string;
}

export interface CountryDailyBudget {
  country: string;
  days: number;
  dailyBudgetEur: number;
  totalEur: number;
}

export interface BudgetDashboardData {
  homeCostsEur: number;
  upfrontCostsEur: number;
  travelCostsEur: number;
  contingencyEur: number;
  totalNeededEur: number;
  alreadyPaidEur: number;
  fundingTotalEur: number;
  fundingLines: BudgetDashboardLine[];
  monthlyIncomeEur: number;
  incomeLines: BudgetDashboardLine[];
  countryDailyBudgets: CountryDailyBudget[];
  sourceSheet: string;
}

export interface CamperDetails {
  activeOption: "camper" | "auto" | "vergelijking";
  carOption: CarRentalDetails;
  carRentals?: CarRentalDetails[];
  modelName: string;
  licensePlate: string;
  ophaallocatie: string;
  inleverlocatie: string;
  ophaaldatum: string;
  inleverdatum: string;
  verzekeringInfo: string;
  kilometerstand: number;
  brandstofverbruikLPer100Km: number;
  tankbeurten: FuelRefill[];
  campings: {
    id: string;
    name: string;
    date: string;
    priceEur: number;
    rating: number;
    address: string;
    wifi: string;
    facilities: string[];
  }[];
  onderhoud: MaintenanceLog[];
  schades: DamageLog[];
  inventaris: InventoryItem[];
  tankLevels: {
    gasPercent: number;
    waterPercent: number;
    afvalwaterPercent: number;
  };
  servicebeurten: {
    id: string;
    date: string;
    km: number;
    description: string;
    verified: boolean;
  }[];
}

export interface CategoryBudget {
  category: ExpenseItem["category"];
  label: string;
  budgetEur: number;
  spentEur: number;
  iconName: string;
}

export interface DocumentItem {
  id: string;
  titel: string;
  categorie:
    | "Paspoort"
    | "ESTA"
    | "Visa"
    | "Verzekering"
    | "Rijbewijs"
    | "Internationaal Rijbewijs"
    | "Vaccinatie"
    | "Medicatieverklaring"
    | "Boekingsbevestiging"
    | "Overig";
  bestandsnaam: string;
  fileType: "pdf" | "img";
  uploadDatum: string;
  vervaldatum?: string;
  familyMemberName?: string;
  notes: string;
  fileContentSimulatedUrl?: string;
  pdfFile?: StoredPdf;
  maatschappij?: string;
  polisnummer?: string;
  alarmnummer?: string;
  startdatum?: string;
}

export interface MedicationReminder {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  timeOfDay: string;
  stockCount: number;
  takenToday: boolean;
}

export interface FamilyMember {
  id: string;
  naam: string;
  rol: "Vader" | "Moeder" | "Zoon" | "Dochter";
  leeftijd: number;
  foto: string;
  medicijnen: MedicationReminder[];
  allergieen: string[];
  noodcontacten: { name: string; relation: string; phone: string }[];
  nabijZiekenhuis: string;
  verzekeringsPolis: string;
  vaccinaties: string[];
}

export interface PackingItem {
  id: string;
  item: string;
  categorie:
    | "Kleding"
    | "Kamperen"
    | "Elektronica"
    | "EHBO"
    | "Kinderen"
    | "Documenten"
    | "Toiletartikelen"
    | "Favorieten";
  status: "Nog kopen" | "Inpakken" | "In koffer" | "In camper";
  toegewezenAan: string;
}

export interface PhotoItem {
  id: string;
  url: string;
  caption: string;
  land: string;
  plaats: string;
  activiteit: string;
  datum: string;
  gps: GPSLocation;
  albumName: string;
}

export interface JournalEntry {
  id: string;
  datum: string;
  land: string;
  plaats: string;
  tekst: string;
  stemming: "Blij" | "Dankbaar" | "Moe" | "Avontuurlijk" | "Relaxed";
  hoogtepunt: string;
  dieptepunt: string;
  geleerdeLessen: string;
  mooisteFoto: string;
  favorieteHerinnering: string;
}

export interface HikeRoute {
  id: string;
  name: string;
  land: string;
  distanceKm: number;
  durationHours: number;
  elevationGainM: number;
  difficulty: "Makkelijk" | "Gemiddeld" | "Zwaar";
  gpsPoints: GPSLocation[];
  rating: number;
  description: string;
  kidFriendlyRating: number;
}

export interface ActivityItem {
  id: string;
  name: string;
  land: string;
  location: string;
  ticketsUrl?: string;
  bookingRef?: string;
  openingHours: string;
  priceEur: number;
  rating: number;
  photos: string[];
  kidFriendlyScore: number; // 1-5
  durationHours: number;
  description: string;
  ticketPdf?: StoredPdf;
}

export interface ChecklistItem {
  id: string;
  text: string;
  category: "pre-departure" | "country-transition";
  countryScope?: string;
  completed: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  type:
    | "flight"
    | "checkin"
    | "medication"
    | "fuel"
    | "visa"
    | "passport"
    | "camper"
    | "activity";
  date: string;
  urgent: boolean;
  read: boolean;
}

export interface EmergencyCountry {
  land: string;
  flag: string;
  alarmnummer: string;
  ziekenhuizen: { name: string; address: string; phone: string }[];
  embassy: { name: string; address: string; phone: string; email: string };
  politie: string;
  arts: string;
  verzekeraarHotline: string;
}

export interface DashboardWidgetConfig {
  id: string;
  title: string;
  enabled: boolean;
}

export interface TripDataState {
  overview: TripOverview;
  timeline: TimelineDay[];
  countries: CountryPlan[];
  savedLocations: SavedLocation[];
  flights: Flight[];
  accommodations: Accommodation[];
  camper: CamperDetails;
  budgetExpenses: ExpenseItem[];
  categoryBudgets: CategoryBudget[];
  budgetDashboard?: BudgetDashboardData;
  documents: DocumentItem[];
  familyMembers: FamilyMember[];
  packingItems: PackingItem[];
  photos: PhotoItem[];
  journals: JournalEntry[];
  hikes: HikeRoute[];
  activities: ActivityItem[];
  checklists: ChecklistItem[];
  notifications: NotificationItem[];
  emergencies: EmergencyCountry[];
  widgetsConfig: DashboardWidgetConfig[];
}
