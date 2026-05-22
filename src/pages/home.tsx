import { Link } from "wouter";
import { useStore } from "@/lib/store";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, BadgeCheck, CalendarDays, Car, ChevronRight, Clock, MapPin, Pause, Play, Shield, Sparkles, Volume2, VolumeX } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { formatMAD } from "@/lib/money";

export default function Home() {
  const { cars } = useStore();
  const featuredCars = cars.filter((c) => c.featured).slice(0, 3);
  const lowestPrice = Math.min(...cars.map((car) => car.pricePerDay));

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1800&q=82"
            alt="Voiture premium sur route"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,hsl(222_39%_11%/0.96)_0%,hsl(222_48%_18%/0.80)_48%,hsl(221_83%_36%/0.22)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
        </div>

        <div className="container relative z-10 grid min-h-[82vh] grid-cols-1 items-center gap-10 py-16 text-white lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-3xl">
            <div className="ed-pill mb-7 border-white/20 bg-white/10 text-white backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-accent" /> La route premium, sans détour
            </div>
            <h1 className="mb-6 text-5xl font-extrabold leading-[0.95] tracking-tight md:text-7xl">
              Louez mieux, roulez serein.
            </h1>
            <p className="mb-9 max-w-2xl text-xl leading-relaxed text-white/76 md:text-2xl">
              {BRAND.name} réunit une flotte soignée, des tarifs clairs et une réservation rapide pour vos trajets business, week-ends et grands départs.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/voitures" className="ed-primary-action px-7 py-4 text-base md:text-lg">
                Explorer la flotte <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/login" className="inline-flex items-center justify-center gap-2.5 rounded-lg border border-white/35 bg-white/10 px-7 py-4 text-base font-extrabold text-white backdrop-blur-md transition-all hover:bg-white/18 md:text-lg">
                Espace client
              </Link>
            </div>
          </div>

          <div className="ed-card border-white/20 bg-white/92 p-6 text-foreground shadow-2xl">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-widest text-accent">Départ rapide</p>
                <h2 className="mt-1 text-2xl font-extrabold">Trouvez votre voiture</h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <Car className="h-6 w-6" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {[
                { icon: MapPin, label: "Ville de départ", value: "Casablanca, Rabat, Marrakech..." },
                { icon: CalendarDays, label: "Dates flexibles", value: "Aujourd'hui ou plus tard" },
                { icon: Shield, label: "Assurance", value: "Protection incluse" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 rounded-lg border border-border/80 bg-muted/45 p-4">
                  <Icon className="h-5 w-5 text-accent" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
                    <p className="font-bold">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-lg bg-primary p-5 text-primary-foreground">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm text-primary-foreground/60">À partir de</p>
                  <p className="text-3xl font-extrabold">{formatMAD(lowestPrice)}<span className="text-sm font-semibold text-primary-foreground/60"> / jour</span></p>
                </div>
                <Link href="/voitures" className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-accent-foreground transition-transform hover:translate-x-1">
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative -mt-10 z-10">
        <div className="container">
          <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-border/70 bg-white shadow-xl md:grid-cols-4">
            {[
              { value: "500+", label: "Clients satisfaits" },
              { value: `${cars.length}`, label: "Véhicules" },
              { value: "15", label: "Villes couvertes" },
              { value: "24/7", label: "Assistance" },
            ].map((stat) => (
              <div key={stat.label} className="border-border/70 px-5 py-6 text-center md:border-r md:last:border-r-0">
                <div className="text-3xl font-extrabold text-primary">{stat.value}</div>
                <div className="text-sm font-semibold text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container">
          <div className="mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-3 text-sm font-extrabold uppercase tracking-widest text-accent">Comment ça marche</p>
              <h2 className="text-3xl font-extrabold md:text-4xl">Réserver sans friction</h2>
            </div>
            <Link href="/voitures" className="ed-secondary-action w-fit px-4 py-2.5 text-sm">
              Voir la flotte <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {[
              { icon: Car, title: "Choisissez", desc: "Filtrez par catégorie, budget, énergie et disponibilité." },
              { icon: CalendarDays, title: "Réservez", desc: "Sélectionnez vos dates et confirmez votre demande en quelques clics." },
              { icon: BadgeCheck, title: "Partez", desc: "Suivez le paiement, la facture et la réservation depuis votre espace client." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="ed-card ed-card-hover p-7">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="mb-3 text-xl font-extrabold">{title}</h3>
                <p className="leading-relaxed text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <MarketingVideo />

      <section id="featured" className="bg-white/70 py-24">
        <div className="container">
          <div className="mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-3 text-sm font-extrabold uppercase tracking-widest text-accent">Sélection du moment</p>
              <h2 className="text-3xl font-extrabold md:text-4xl">Véhicules recommandés</h2>
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
              <Clock className="h-4 w-4 text-accent" /> Réservation rapide
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {featuredCars.map((car) => (
              <div key={car.id} className="ed-card ed-card-hover group overflow-hidden">
                <div className="relative h-60 overflow-hidden">
                  <img src={car.imageUrl} alt={`${car.brand} ${car.model}`} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent" />
                  <span className="ed-pill absolute left-4 top-4 border-white/70 bg-white/90 text-primary backdrop-blur-sm">{car.category}</span>
                </div>
                <div className="p-6">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <p className="mb-0.5 text-xs font-medium text-muted-foreground">{car.year}</p>
                      <h3 className="text-xl font-extrabold">{car.brand} {car.model}</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-extrabold text-accent">{formatMAD(car.pricePerDay)}</span>
                      <span className="block text-xs font-medium text-muted-foreground">/jour</span>
                    </div>
                  </div>
                  <Link href={`/voitures/${car.id}`} className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3.5 font-bold text-primary-foreground transition-all duration-200 hover:bg-accent">
                    Réserver <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ed-page-hero py-20">
        <div className="container flex flex-col items-center justify-between gap-7 text-white md:flex-row">
          <div>
            <p className="mb-3 text-sm font-extrabold uppercase tracking-widest text-accent">{BRAND.shortName}</p>
            <h2 className="max-w-2xl text-3xl font-extrabold md:text-4xl">Votre prochaine route commence ici</h2>
          </div>
          <Link href="/voitures" className="ed-primary-action shrink-0 px-8 py-4 text-lg">
            Choisir mon véhicule <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function MarketingVideo() {
  const [playing, setPlaying] = useState(true);
  const [soundOn, setSoundOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const melodyTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const beatTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoUrl = "https://assets.mixkit.co/videos/preview/mixkit-pickup-truck-driving-along-an-asphalt-road-through-a-forest-41558-large.mp4";

  useEffect(() => {
    return () => stopMusic();
  }, []);

  const stopMusic = () => {
    if (melodyTimerRef.current) clearInterval(melodyTimerRef.current);
    if (beatTimerRef.current) clearInterval(beatTimerRef.current);
    melodyTimerRef.current = null;
    beatTimerRef.current = null;
    gainRef.current?.disconnect();
    gainRef.current = null;
  };

  const playTone = (context: AudioContext, destination: AudioNode, frequency: number, duration: number, type: OscillatorType, volume: number) => {
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0, context.currentTime);
    gain.gain.linearRampToValueAtTime(volume, context.currentTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
    osc.connect(gain);
    gain.connect(destination);
    osc.start();
    osc.stop(context.currentTime + duration);
  };

  const startMusic = async () => {
    stopMusic();
    const AudioContextClass = window.AudioContext || (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = audioContextRef.current ?? new AudioContextClass();
    audioContextRef.current = context;
    await context.resume();

    const master = context.createGain();
    master.gain.value = 0.08;
    master.connect(context.destination);
    gainRef.current = master;

    const melody = [523.25, 659.25, 783.99, 880, 783.99, 659.25, 587.33, 659.25];
    const harmony = [261.63, 329.63, 392, 440];
    let step = 0;

    melodyTimerRef.current = setInterval(() => {
      playTone(context, master, melody[step % melody.length], 0.24, "sine", 0.12);
      if (step % 2 === 0) playTone(context, master, harmony[Math.floor(step / 2) % harmony.length], 0.46, "sine", 0.06);
      step += 1;
    }, 320);

    beatTimerRef.current = setInterval(() => {
      playTone(context, master, 1046.5, 0.045, "sine", 0.035);
      setTimeout(() => playTone(context, master, 1318.5, 0.045, "sine", 0.026), 220);
    }, 640);
  };

  const toggleVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setPlaying(true);
    } else {
      video.pause();
      stopMusic();
      setPlaying(false);
    }
  };

  const toggleSound = async () => {
    if (soundOn) {
      stopMusic();
      setSoundOn(false);
      return;
    }
    await startMusic();
    setSoundOn(true);
    if (videoRef.current?.paused) {
      await videoRef.current.play();
      setPlaying(true);
    }
  };

  return (
    <section className="bg-primary py-20 text-primary-foreground">
      <div className="container grid grid-cols-1 items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="mb-3 text-sm font-extrabold uppercase tracking-widest text-accent">Vidéo marketing</p>
          <h2 className="mb-5 text-4xl font-extrabold leading-tight md:text-6xl">La location premium, en mode express.</h2>
          <p className="mb-7 max-w-xl text-lg leading-relaxed text-primary-foreground/70">
            Une vidéo dynamique pour montrer le parcours {BRAND.shortName}: voiture disponible, paiement sécurisé, facture PDF et départ immédiat.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/voitures" className="ed-primary-action px-6 py-3">
              Voir la flotte <ArrowRight className="h-4 w-4" />
            </Link>
            <button onClick={toggleVideo} className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 px-6 py-3 font-extrabold text-white transition-colors hover:bg-white/16">
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {playing ? "Pause" : "Lecture"}
            </button>
            <button onClick={toggleSound} className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 px-6 py-3 font-extrabold text-white transition-colors hover:bg-white/16">
              {soundOn ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              {soundOn ? "Couper la musique" : "Activer la musique"}
            </button>
          </div>
        </div>

        <div className={`ed-marketing-video ${playing ? "is-playing" : "is-paused"}`} aria-label={`Vidéo marketing ${BRAND.name}`}>
          <video
            ref={videoRef}
            className="ed-real-video"
            src={videoUrl}
            poster="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1400&q=82"
            autoPlay
            muted
            loop
            playsInline
            controls
            onPlay={() => setPlaying(true)}
            onPause={() => {
              setPlaying(false);
              stopMusic();
            }}
          >
            Votre navigateur ne supporte pas la vidéo.
          </video>
          <div className="ed-real-video-overlay" />
          <div className="ed-video-card ed-video-card-one">
            <span>01</span>
            <strong>Choisissez</strong>
            <small>Flotte premium</small>
          </div>
          <div className="ed-video-card ed-video-card-two">
            <span>02</span>
            <strong>Payez</strong>
            <small>Carte sécurisée</small>
          </div>
          <div className="ed-video-card ed-video-card-three">
            <span>03</span>
            <strong>Facture PDF</strong>
            <small>Disponible instantanément</small>
          </div>
          <div className="ed-video-caption">
            <Sparkles className="h-4 w-4 text-accent" />
            {BRAND.name} transforme chaque départ en réservation simple.
          </div>
        </div>
      </div>
    </section>
  );
}
