import { Switch, Route, Router as WouterRouter, Link, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StoreProvider, useStore } from "@/lib/store";
import { LogIn, LogOut, ChevronDown, LayoutDashboard, Car, CalendarCheck, CreditCard, ReceiptText, UserCircle, Gift, BadgePercent, Crown } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { BrandLogo } from "@/components/brand-logo";
import NotFound from "@/pages/not-found";

import Home from "./pages/home";
import Cars from "./pages/cars";
import CarDetail from "./pages/car-detail";
import Bookings from "./pages/bookings";
import ClientDashboard from "./pages/client-dashboard";
import Payments from "./pages/payments";
import Invoices from "./pages/invoices";
import Login from "./pages/login";
import AdminDashboard from "./pages/admin-dashboard";
import AdminCars from "./pages/admin-cars";
import AdminBookings from "./pages/admin-bookings";
import AdminPayments from "./pages/admin-payments";
import AdminInvoices from "./pages/admin-invoices";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

function Layout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout, bookings } = useStore();
  const [location, setLocation] = useLocation();
  const paidBookings = bookings.filter((booking) => booking.userEmail === user?.email && (booking.paymentStatus ?? "unpaid") === "paid").length;
  const loyaltyLabel = paidBookings >= 5 ? "Client fidèle Gold" : paidBookings >= 2 ? "Client fidèle Silver" : "Nouveau client";
  const loyaltyDiscount = paidBookings >= 5 ? "-15%" : paidBookings >= 2 ? "-10%" : "-5%";
  const navLinkClass = (href: string) =>
    `shrink-0 px-4 py-2.5 text-sm font-extrabold rounded-full transition-all ${
      location === href
        ? "bg-primary text-primary-foreground shadow-sm"
        : "text-foreground/62 hover:bg-white hover:text-primary hover:shadow-sm"
    }`;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <div className="overflow-hidden border-b border-accent/20 bg-primary text-primary-foreground">
        <div className="ed-promo-marquee min-h-11 py-2 text-xs font-bold sm:text-sm">
          <div className="ed-promo-track">
            <div className="inline-flex items-center gap-2 px-5">
              <BadgePercent className="h-4 w-4 text-accent" />
              <span>Promotion semaine: -20% sur les SUV avec le code <span className="text-accent">EASY20</span></span>
            </div>
            <div className="inline-flex items-center gap-2 px-5 text-primary-foreground/85">
              {isAuthenticated ? (
                <>
                  <Crown className="h-4 w-4 text-accent" />
                  <span>{loyaltyLabel}: avantage {loyaltyDiscount} sur votre prochaine réservation</span>
                </>
              ) : (
                <>
                  <Gift className="h-4 w-4 text-accent" />
                  <span>Connectez-vous pour activer les avantages client fidèle</span>
                </>
              )}
            </div>
            <div className="inline-flex items-center gap-2 px-5">
              <BadgePercent className="h-4 w-4 text-accent" />
              <span>Facture PDF instantanée après paiement par carte</span>
            </div>
            <div className="inline-flex items-center gap-2 px-5 text-primary-foreground/85" aria-hidden="true">
              <BadgePercent className="h-4 w-4 text-accent" />
              <span>Promotion semaine: -20% sur les SUV avec le code <span className="text-accent">EASY20</span></span>
            </div>
          </div>
        </div>
      </div>
      <header className="sticky top-0 z-50 w-full border-b border-white/70 bg-white/82 shadow-[0_14px_40px_hsl(222_39%_11%/0.08)] backdrop-blur-2xl supports-[backdrop-filter]:bg-white/72">
        <div className="container flex min-h-[4.75rem] flex-wrap items-center justify-between gap-3 py-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="bg-[linear-gradient(135deg,hsl(var(--primary))_0%,hsl(var(--accent))_100%)] text-primary-foreground p-3 rounded-xl shadow-md shadow-primary/15 ring-1 ring-white/40 transition-all group-hover:scale-105 group-hover:shadow-lg">
              <BrandLogo className="w-7 h-7" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-primary leading-none">
              {BRAND.shortName}<span className="text-accent"> Pro</span>
            </span>
          </Link>

          <nav className="order-3 flex w-full items-center gap-1.5 overflow-x-auto rounded-full border border-border/80 bg-muted/70 p-1 md:order-none md:w-auto md:overflow-visible">
            <Link href="/voitures" className={navLinkClass("/voitures")}>
              Notre Flotte
            </Link>
            {isAuthenticated && (
              <Link href="/dashboard" className={navLinkClass("/dashboard")}>
                Dashboard
              </Link>
            )}
            {isAuthenticated && (
              <Link href="/mes-reservations" className={navLinkClass("/mes-reservations")}>
                Mes réservations
              </Link>
            )}
            {isAuthenticated && (
              <Link href="/paiements" className={navLinkClass("/paiements")}>
                Paiements
              </Link>
            )}
            {isAuthenticated && (
              <Link href="/factures" className={navLinkClass("/factures")}>
                Factures
              </Link>
            )}
            {user?.isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger className={`flex shrink-0 items-center gap-1.5 px-4 py-2.5 text-sm font-extrabold rounded-full transition-all outline-none ${location.startsWith("/admin") ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground/62 hover:bg-white hover:text-primary hover:shadow-sm"}`}>
                  Administration <ChevronDown className="w-3.5 h-3.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 rounded-xl border-border/80 p-2 shadow-xl">
                  <DropdownMenuItem onClick={() => setLocation("/admin")} className="gap-2">
                    <LayoutDashboard className="w-4 h-4" /> Tableau de bord
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation("/admin/voitures")} className="gap-2">
                    <Car className="w-4 h-4" /> Gestion des véhicules
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation("/admin/reservations")} className="gap-2">
                    <CalendarCheck className="w-4 h-4" /> Gestion des réservations
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation("/admin/paiements")} className="gap-2">
                    <CreditCard className="w-4 h-4" /> Gestion des paiements
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation("/admin/factures")} className="gap-2">
                    <ReceiptText className="w-4 h-4" /> Factures clients
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>

          <div className="flex items-center gap-2 md:gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2 md:gap-3">
                <span className="text-sm font-medium text-foreground/60 hidden md:inline-block">
                  Bonjour, <span className="text-foreground font-semibold">{user?.name}</span>
                </span>
                <Link href="/dashboard" className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-primary transition-colors hover:bg-accent hover:text-accent-foreground">
                  <UserCircle className="w-5 h-5" />
                </Link>
                <button onClick={() => logout()} className="text-sm font-extrabold text-foreground/60 hover:text-destructive flex items-center gap-1.5 px-3.5 py-2.5 rounded-full hover:bg-destructive/5 transition-colors">
                  <LogOut className="w-4 h-4" />
                  <span className="hidden md:inline-block">Déconnexion</span>
                </button>
              </div>
            ) : (
              <Link href="/login" className="ed-primary-action px-5 py-2.5 text-sm rounded-full">
                <LogIn className="w-4 h-4" /> Connexion
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-[linear-gradient(135deg,hsl(var(--primary))_0%,hsl(222_48%_18%)_58%,hsl(221_83%_36%)_100%)] text-primary-foreground">
        <div className="container py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="bg-accent text-accent-foreground p-2.5 rounded-lg">
                  <BrandLogo className="w-6 h-6" />
                </div>
                <span className="font-extrabold text-xl">{BRAND.shortName}<span className="text-accent"> Pro</span></span>
              </div>
              <p className="text-primary-foreground/65 text-sm leading-relaxed">La route premium, sans détour. Réservez vite, partez serein.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-sm uppercase tracking-widest text-primary-foreground/40">Navigation</h4>
              <ul className="space-y-2.5 text-sm text-primary-foreground/70">
                <li><Link href="/" className="hover:text-accent transition-colors">Accueil</Link></li>
                <li><Link href="/voitures" className="hover:text-accent transition-colors">Notre flotte</Link></li>
                {isAuthenticated && <li><Link href="/dashboard" className="hover:text-accent transition-colors">Dashboard client</Link></li>}
                {isAuthenticated && <li><Link href="/mes-reservations" className="hover:text-accent transition-colors">Mes réservations</Link></li>}
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-sm uppercase tracking-widest text-primary-foreground/40">Contact</h4>
              <ul className="space-y-2.5 text-sm text-primary-foreground/70">
                <li>{BRAND.email}</li>
                <li>{BRAND.phone}</li>
                <li>Lun–Dim, 8h–20h</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-primary-foreground/10 pt-6 text-center text-sm text-primary-foreground/40">
            &copy; {new Date().getFullYear()} {BRAND.name}. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/voitures" component={Cars} />
        <Route path="/voitures/:id" component={CarDetail} />
        <Route path="/dashboard" component={ClientDashboard} />
        <Route path="/mes-reservations" component={Bookings} />
        <Route path="/paiements" component={Payments} />
        <Route path="/factures" component={Invoices} />
        <Route path="/login" component={Login} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/voitures" component={AdminCars} />
        <Route path="/admin/reservations" component={AdminBookings} />
        <Route path="/admin/paiements" component={AdminPayments} />
        <Route path="/admin/factures" component={AdminInvoices} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <StoreProvider>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </StoreProvider>
  );
}

export default App;
