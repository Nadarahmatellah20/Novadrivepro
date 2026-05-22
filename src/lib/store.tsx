import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { sendPasswordResetEmail } from "@/lib/email-service";
import { BRAND } from "@/lib/brand";

export interface Car {
  id: number;
  brand: string;
  model: string;
  year: number;
  category: string;
  pricePerDay: number;
  imageUrl: string;
  seats: number;
  transmission: string;
  fuel: string;
  description: string;
  available: boolean;
  featured: boolean;
}

export interface Booking {
  id: number;
  carId: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled";
  paymentStatus?: "unpaid" | "paid" | "refunded";
  paymentMethod?: string;
  paidAt?: string;
  userName: string;
  userEmail: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  provider?: "email" | "google" | "apple";
}

export interface PaymentCard {
  id: string;
  userEmail: string;
  brand: "Visa" | "Mastercard" | "Amex" | "Carte";
  holder: string;
  last4: string;
  expiry: string;
  isDefault: boolean;
}

interface StoredUser extends User {
  password?: string;
  createdAt: string;
}

const INITIAL_CARS: Car[] = [
  { id: 1, brand: "BMW", model: "Série 5", year: 2023, category: "Berline", pricePerDay: 1200, imageUrl: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80", seats: 5, transmission: "automatique", fuel: "essence", description: "La BMW Série 5 allie confort, technologie et performances. Un choix d'exception pour vos déplacements professionnels.", available: true, featured: true },
  { id: 2, brand: "Toyota", model: "RAV4", year: 2023, category: "SUV", pricePerDay: 900, imageUrl: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80", seats: 5, transmission: "automatique", fuel: "hybride", description: "Le Toyota RAV4 Hybride offre polyvalence et économie. Idéal pour la ville comme pour les longues distances.", available: true, featured: true },
  { id: 3, brand: "Mercedes", model: "Classe E", year: 2024, category: "Berline", pricePerDay: 1500, imageUrl: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80", seats: 5, transmission: "automatique", fuel: "diesel", description: "L'élégance et le raffinement à l'état pur. La Mercedes Classe E redéfinit le luxe automobile.", available: true, featured: true },
  { id: 4, brand: "Renault", model: "Clio", year: 2023, category: "Citadine", pricePerDay: 450, imageUrl: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=80", seats: 5, transmission: "manuelle", fuel: "essence", description: "Compacte et agile, la Renault Clio est parfaite pour se faufiler en ville. Économique et pratique.", available: true, featured: true },
  { id: 5, brand: "Porsche", model: "911", year: 2024, category: "Sport", pricePerDay: 3500, imageUrl: "https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=800&q=80", seats: 2, transmission: "automatique", fuel: "essence", description: "L'icône du sport automobile. La Porsche 911 offre des sensations de conduite incomparables.", available: true, featured: false },
  { id: 6, brand: "Tesla", model: "Model 3", year: 2024, category: "Berline", pricePerDay: 1100, imageUrl: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&q=80", seats: 5, transmission: "automatique", fuel: "electrique", description: "La Tesla Model 3 réinvente la berline électrique. Technologie de pointe et autonomie impressionnante.", available: true, featured: false },
  { id: 7, brand: "Peugeot", model: "3008", year: 2023, category: "SUV", pricePerDay: 750, imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80", seats: 5, transmission: "automatique", fuel: "diesel", description: "Le Peugeot 3008 combine style, espace et efficacité. Un SUV familial haut de gamme.", available: false, featured: false },
  { id: 8, brand: "Audi", model: "A4", year: 2023, category: "Berline", pricePerDay: 1300, imageUrl: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80", seats: 5, transmission: "automatique", fuel: "essence", description: "L'Audi A4 incarne la modernité et la sportivité premium. Technologie de pointe et plaisir de conduite.", available: true, featured: false },
];

const CARS_KEY = "ed_cars";
const BOOKINGS_KEY = "ed_bookings";
const USER_KEY = "ed_user";
const USERS_KEY = "ed_users";
const PAYMENT_CARDS_KEY = "ed_payment_cards";

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

interface StoreContextType {
  cars: Car[];
  bookings: Booking[];
  paymentCards: PaymentCard[];
  user: User | null;
  isAuthenticated: boolean;
  addCar: (car: Omit<Car, "id">) => void;
  updateCar: (id: number, data: Partial<Car>) => void;
  deleteCar: (id: number) => void;
  addBooking: (data: { carId: number; startDate: string; endDate: string }) => void;
  addAdminBooking: (data: Omit<Booking, "id" | "totalPrice"> & { totalPrice?: number }) => void;
  updateBooking: (id: number, data: Partial<Booking>) => void;
  updateBookingStatus: (id: number, status: Booking["status"]) => void;
  updatePaymentStatus: (id: number, paymentStatus: NonNullable<Booking["paymentStatus"]>, paymentMethod?: string) => void;
  cancelBooking: (id: number) => void;d
  deleteBooking: (id: number) => void;
  login: (name: string, email: string, password: string) => { ok: boolean; error?: string };
  register: (name: string, email: string, password: string) => { ok: boolean; error?: string };
  continueWithProvider: (provider: "google" | "apple", email?: string) => { ok: boolean; error?: string };
  requestPasswordReset: (email: string) => Promise<{ ok: boolean; error?: string }>;
  verifyResetCode: (email: string, code: string) => { ok: boolean; error?: string };
  resetPassword: (email: string, code: string, password: string, confirmPassword: string) => { ok: boolean; error?: string };
  addPaymentCard: (data: { brand: PaymentCard["brand"]; holder: string; number: string; expiry: string }) => { ok: boolean; error?: string; card?: PaymentCard };
  setDefaultPaymentCard: (id: string) => void;
  deletePaymentCard: (id: string) => void;
  logout: () => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

const ADMIN_EMAIL = BRAND.adminEmail;
const ADMIN_PASSWORD = BRAND.adminPassword;

const INITIAL_USERS: StoredUser[] = [
  {
    id: ADMIN_EMAIL,
    name: "Admin",
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    isAdmin: true,
    provider: "email",
    createdAt: new Date(0).toISOString(),
  },
];

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function validateAuth(name: string, email: string, password: string, requireName: boolean): string | null {
  if (requireName && name.trim().length < 2) return "Le nom doit contenir au moins 2 caractères.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email))) return "Adresse e-mail invalide.";
  if (password.length < 6) return "Le mot de passe doit contenir au moins 6 caractères.";
  return null;
}

function detectCardBrand(number: string): PaymentCard["brand"] {
  const digits = number.replace(/\D/g, "");
  if (/^4/.test(digits)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "Mastercard";
  if (/^3[47]/.test(digits)) return "Amex";
  return "Carte";
}

function validatePaymentCard(brand: PaymentCard["brand"], holder: string, number: string, expiry: string): string | null {
  const digits = number.replace(/\D/g, "");
  if (!["Visa", "Mastercard", "Amex", "Carte"].includes(brand)) return "Choisissez le type de carte.";
  if (holder.trim().length < 3) return "Nom du titulaire obligatoire.";
  if (digits.length < 13 || digits.length > 19) return "Numéro de carte invalide.";
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry.trim())) return "Expiration au format MM/AA.";
  const [month, year] = expiry.split("/").map(Number);
  const expiresAt = new Date(2000 + year, month, 0, 23, 59, 59);
  if (expiresAt < new Date()) return "Cette carte est expirée.";
  return null;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cars, setCars] = useState<Car[]>(() => load(CARS_KEY, INITIAL_CARS));
  const [bookings, setBookings] = useState<Booking[]>(() => load(BOOKINGS_KEY, []));
  const [paymentCards, setPaymentCards] = useState<PaymentCard[]>(() => load(PAYMENT_CARDS_KEY, []));
  const [resetCodes, setResetCodes] = useState<Record<string, string>>({});
  const [user, setUser] = useState<User | null>(() => load(USER_KEY, null));
  const [users, setUsers] = useState<StoredUser[]>(() => {
    const saved = load<StoredUser[]>(USERS_KEY, []);
    const byEmail = new Map([...INITIAL_USERS, ...saved].map((u) => [normalizeEmail(u.email), { ...u, email: normalizeEmail(u.email), id: normalizeEmail(u.email) }]));
    return Array.from(byEmail.values());
  });

  useEffect(() => { save(CARS_KEY, cars); }, [cars]);
  useEffect(() => { save(BOOKINGS_KEY, bookings); }, [bookings]);
  useEffect(() => { save(PAYMENT_CARDS_KEY, paymentCards); }, [paymentCards]);
  useEffect(() => { save(USER_KEY, user); }, [user]);
  useEffect(() => { save(USERS_KEY, users); }, [users]);

  const addCar = useCallback((data: Omit<Car, "id">) => {
    setCars((prev) => {
      const next = [...prev, { ...data, id: Date.now() }];
      return next;
    });
  }, []);

  const updateCar = useCallback((id: number, data: Partial<Car>) => {
    setCars((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
  }, []);

  const deleteCar = useCallback((id: number) => {
    setCars((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const addBooking = useCallback((data: { carId: number; startDate: string; endDate: string }) => {
    if (!user) return;
    const car = cars.find((c) => c.id === data.carId);
    if (!car) return;
    const days = Math.max(1,
      Math.ceil((new Date(data.endDate).getTime() - new Date(data.startDate).getTime()) / 86400000) + 1
    );
    const booking: Booking = {
      id: Date.now(),
      carId: data.carId,
      startDate: data.startDate,
      endDate: data.endDate,
      totalPrice: days * car.pricePerDay,
      status: "pending",
      paymentStatus: "unpaid",
      userName: user.name,
      userEmail: user.email,
    };
    setBookings((prev) => [...prev, booking]);
  }, [user, cars]);

  const calculateBookingTotal = useCallback((carId: number, startDate: string, endDate: string) => {
    const car = cars.find((c) => c.id === carId);
    if (!car) return 0;
    const days = Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000) + 1);
    return days * car.pricePerDay;
  }, [cars]);

  const addAdminBooking = useCallback((data: Omit<Booking, "id" | "totalPrice"> & { totalPrice?: number }) => {
    const booking: Booking = {
      ...data,
      id: Date.now(),
      totalPrice: data.totalPrice && data.totalPrice > 0 ? data.totalPrice : calculateBookingTotal(data.carId, data.startDate, data.endDate),
    };
    setBookings((prev) => [...prev, booking]);
  }, [calculateBookingTotal]);

  const updateBooking = useCallback((id: number, data: Partial<Booking>) => {
    setBookings((prev) => prev.map((booking) => {
      if (booking.id !== id) return booking;
      const next = { ...booking, ...data };
      const datesChanged = data.carId !== undefined || data.startDate !== undefined || data.endDate !== undefined;
      return datesChanged && data.totalPrice === undefined
        ? { ...next, totalPrice: calculateBookingTotal(next.carId, next.startDate, next.endDate) }
        : next;
    }));
  }, [calculateBookingTotal]);

  const updateBookingStatus = useCallback((id: number, status: Booking["status"]) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
  }, []);

  const updatePaymentStatus = useCallback((id: number, paymentStatus: NonNullable<Booking["paymentStatus"]>, paymentMethod = "Carte bancaire") => {
    setBookings((prev) => prev.map((b) => (
      b.id === id
        ? {
            ...b,
            paymentStatus,
            paymentMethod: paymentStatus === "paid" ? paymentMethod : b.paymentMethod,
            paidAt: paymentStatus === "paid" ? new Date().toISOString() : b.paidAt,
          }
        : b
    )));
  }, []);

  const cancelBooking = useCallback((id: number) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b)));
  }, []);

  const deleteBooking = useCallback((id: number) => {
    setBookings((prev) => prev.filter((booking) => booking.id !== id));
  }, []);

  const login = useCallback((name: string, email: string, password: string): { ok: boolean; error?: string } => {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail || !password) return { ok: false, error: "E-mail et mot de passe obligatoires." };
    const existing = users.find((u) => normalizeEmail(u.email) === normalizedEmail);
    if (!existing) return { ok: false, error: "Aucun compte trouvé avec cet e-mail. Créez un compte d'abord." };
    if (existing.provider && existing.provider !== "email" && !existing.password) {
      return { ok: false, error: `Ce compte utilise ${existing.provider === "google" ? "Google" : "Apple"}. Continuez avec ce fournisseur ou réinitialisez le mot de passe.` };
    }
    if (existing.password !== password) return { ok: false, error: "Mot de passe incorrect." };

    const nextUser: User = {
      id: existing.id,
      name: existing.name || name.trim() || normalizedEmail.split("@")[0],
      email: normalizedEmail,
      isAdmin: existing.isAdmin,
      provider: existing.provider ?? "email",
    };
    setUser(nextUser);
    return { ok: true };
  }, [users]);

  const register = useCallback((name: string, email: string, password: string): { ok: boolean; error?: string } => {
    const validationError = validateAuth(name, email, password, true);
    if (validationError) return { ok: false, error: validationError };
    const normalizedEmail = normalizeEmail(email);
    if (normalizedEmail === ADMIN_EMAIL) return { ok: false, error: "Ce compte admin existe déjà." };
    if (users.some((u) => normalizeEmail(u.email) === normalizedEmail)) {
      return { ok: false, error: "Un compte existe déjà avec cet e-mail." };
    }
    const newUser: StoredUser = {
      id: normalizedEmail,
      name: name.trim(),
      email: normalizedEmail,
      password,
      isAdmin: false,
      provider: "email",
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, newUser]);
    setUser(newUser);
    return { ok: true };
  }, [users]);

  const continueWithProvider = useCallback((provider: "google" | "apple", email?: string): { ok: boolean; error?: string } => {
    const fallbackEmail = provider === "google" ? "google.client@novadrive.local" : "apple.client@privaterelay.novadrive.local";
    const normalizedEmail = normalizeEmail(email || fallbackEmail);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) return { ok: false, error: "Entrez un e-mail valide avant de continuer." };
    if (normalizedEmail === ADMIN_EMAIL) return { ok: false, error: "Le compte admin se connecte avec mot de passe." };

    const existing = users.find((u) => normalizeEmail(u.email) === normalizedEmail);
    const providerName = provider === "google" ? "Google" : "Apple";
    if (existing && existing.provider === "email" && existing.password) {
      return { ok: false, error: `Ce compte existe déjà avec mot de passe. Connectez-vous normalement ou réinitialisez-le.` };
    }

    const nextUser: User = existing ?? {
      id: normalizedEmail,
      name: `${providerName} Client`,
      email: normalizedEmail,
      isAdmin: false,
      provider,
    };

    if (!existing) {
      setUsers((prev) => [...prev, { ...nextUser, provider, createdAt: new Date().toISOString() }]);
    }
    setUser({ ...nextUser, provider });
    return { ok: true };
  }, [users]);

  const requestPasswordReset = useCallback(async (email: string): Promise<{ ok: boolean; error?: string }> => {
    const normalizedEmail = normalizeEmail(email);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) return { ok: false, error: "Adresse e-mail invalide." };
    const existing = users.find((u) => normalizeEmail(u.email) === normalizedEmail);
    if (!existing) return { ok: false, error: "Aucun compte trouvé avec cet e-mail." };
    if (existing.isAdmin) return { ok: false, error: "Le mot de passe admin ne peut pas être modifié dans la démo." };

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const emailResult = await sendPasswordResetEmail({ toEmail: normalizedEmail, code, name: existing.name });
    if (!emailResult.ok) return { ok: false, error: emailResult.error };

    setResetCodes((prev) => ({ ...prev, [normalizedEmail]: code }));
    return { ok: true };
  }, [users]);

  const resetPassword = useCallback((email: string, code: string, password: string, confirmPassword: string): { ok: boolean; error?: string } => {
    const normalizedEmail = normalizeEmail(email);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) return { ok: false, error: "Adresse e-mail invalide." };
    if (!resetCodes[normalizedEmail] || resetCodes[normalizedEmail] !== code.trim()) return { ok: false, error: "Code de vérification incorrect." };
    if (password.length < 6) return { ok: false, error: "Le mot de passe doit contenir au moins 6 caractères." };
    if (password !== confirmPassword) return { ok: false, error: "Les deux mots de passe ne correspondent pas." };

    const existing = users.find((u) => normalizeEmail(u.email) === normalizedEmail);
    if (!existing) return { ok: false, error: "Aucun compte trouvé avec cet e-mail." };
    if (existing.isAdmin) return { ok: false, error: "Le mot de passe admin ne peut pas être modifié dans la démo." };

    setUsers((prev) => prev.map((u) => (
      normalizeEmail(u.email) === normalizedEmail ? { ...u, password, provider: "email" } : u
    )));
    setResetCodes((prev) => {
      const next = { ...prev };
      delete next[normalizedEmail];
      return next;
    });
    return { ok: true };
  }, [resetCodes, users]);

  const verifyResetCode = useCallback((email: string, code: string): { ok: boolean; error?: string } => {
    const normalizedEmail = normalizeEmail(email);
    if (!resetCodes[normalizedEmail]) return { ok: false, error: "Envoyez d'abord le code de vérification." };
    if (resetCodes[normalizedEmail] !== code.trim()) return { ok: false, error: "Code de vérification incorrect." };
    return { ok: true };
  }, [resetCodes]);

  const addPaymentCard = useCallback((data: { brand: PaymentCard["brand"]; holder: string; number: string; expiry: string }) => {
    if (!user) return { ok: false, error: "Connectez-vous avant d'ajouter une carte." };
    const validationError = validatePaymentCard(data.brand, data.holder, data.number, data.expiry);
    if (validationError) return { ok: false, error: validationError };
    const digits = data.number.replace(/\D/g, "");
    const userCards = paymentCards.filter((card) => card.userEmail === user.email);
    const card: PaymentCard = {
      id: `${Date.now()}`,
      userEmail: user.email,
      brand: data.brand || detectCardBrand(digits),
      holder: data.holder.trim(),
      last4: digits.slice(-4),
      expiry: data.expiry.trim(),
      isDefault: userCards.length === 0,
    };
    setPaymentCards((prev) => card.isDefault
      ? [...prev.map((item) => item.userEmail === user.email ? { ...item, isDefault: false } : item), card]
      : [...prev, card]
    );
    return { ok: true, card };
  }, [paymentCards, user]);

  const setDefaultPaymentCard = useCallback((id: string) => {
    if (!user) return;
    setPaymentCards((prev) => prev.map((card) => (
      card.userEmail === user.email ? { ...card, isDefault: card.id === id } : card
    )));
  }, [user]);

  const deletePaymentCard = useCallback((id: string) => {
    if (!user) return;
    setPaymentCards((prev) => {
      const next = prev.filter((card) => card.id !== id);
      const userCards = next.filter((card) => card.userEmail === user.email);
      if (userCards.length > 0 && !userCards.some((card) => card.isDefault)) {
        const firstUserCardId = userCards[0].id;
        return next.map((card) => card.id === firstUserCardId ? { ...card, isDefault: true } : card);
      }
      return next;
    });
  }, [user]);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <StoreContext.Provider value={{
      cars,
      bookings,
      paymentCards: user ? paymentCards.filter((card) => card.userEmail === user.email) : [],
      user,
      isAuthenticated: !!user,
      addCar, updateCar, deleteCar,
      addBooking, addAdminBooking, updateBooking, updateBookingStatus, updatePaymentStatus, cancelBooking, deleteBooking,
      login, register, continueWithProvider, requestPasswordReset, verifyResetCode, resetPassword,
      addPaymentCard, setDefaultPaymentCard, deletePaymentCard,
      logout,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
