import { useCallback, useEffect, useState, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HUDTicker from "./components/HUDTicker";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Marquee from "./components/Marquee";
import About from "./components/About";
import Journey from "./components/Journey";
import Achievements from "./components/Achievements";
import Capabilities from "./components/Capabilities";
import Projects from "./components/Projects";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import CursorTrail from "./components/CursorTrail";
import Mascot from "./components/Mascot";
import { useKonamiCode } from "./hooks/useKonamiCode";
import { useClickCombo } from "./hooks/useClickCombo";
import { useCommandPaletteShortcut } from "./hooks/useCommandPaletteShortcut";

const EasterEggOverlay = lazy(() => import("./components/EasterEggOverlay"));
const CommandPalette = lazy(() => import("./components/CommandPalette"));

type EggKind = "konami" | "logo" | null;

const EGG_COPY: Record<Exclude<EggKind, null>, { title: string; message: string }> = {
  konami: {
    title: "Konami Protocol Unlocked",
    message:
      "Thirty lives, one nostalgia hit. You know the code — you probably also read READMEs. Respect.",
  },
  logo: {
    title: "Signal Traced",
    message:
      "Five clicks on the logo and you found the hidden channel. Curiosity like that is basically a job requirement in this field.",
  },
};

function App() {
  const [egg, setEgg] = useState<EggKind>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const triggerKonami = useCallback(() => setEgg("konami"), []);
  const triggerLogo = useCallback(() => setEgg("logo"), []);
  const closeEgg = useCallback(() => setEgg(null), []);
  const openPalette = useCallback(() => setPaletteOpen(true), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);
  const showToast = useCallback((message: string) => setToast(message), []);

  const [eggEverOpened, setEggEverOpened] = useState(false);
  const [paletteEverOpened, setPaletteEverOpened] = useState(false);
  useEffect(() => {
    if (egg !== null) setEggEverOpened(true);
  }, [egg]);
  useEffect(() => {
    if (paletteOpen) setPaletteEverOpened(true);
  }, [paletteOpen]);

  useKonamiCode(triggerKonami);
  const handleLogoClick = useClickCombo(triggerLogo);
  useCommandPaletteShortcut(openPalette);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <div className="min-h-screen bg-void text-ink">
      <CursorTrail />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[80] focus:rounded-md focus:bg-panel focus:px-4 focus:py-2 focus:font-mono focus:text-sm focus:text-ink focus:outline focus:outline-2 focus:outline-amber"
      >
        Skip to content
      </a>
      <HUDTicker />
      <Navbar onLogoClick={handleLogoClick} onOpenPalette={openPalette} />

      {/* Fixed Top-Right Page Mascot watching cursor across full viewport */}
      <div className="fixed right-3 top-16 z-40 transition-transform duration-300 hover:scale-105 sm:right-6 sm:top-16 md:right-8 md:top-16">
        <div className="group relative flex flex-col items-center">
          <div className="rounded-full border border-amber/30 bg-panel/80 p-1 shadow-[0_0_20px_rgba(255,122,51,0.2)] backdrop-blur-md transition-colors hover:border-amber">
            <Mascot
              directions="/mascots/vannsh-directions.webp"
              reactions="/mascots/vannsh-reactions.webp"
              size={95}
              label="Vannsh chibi mascot"
            />
          </div>
        </div>
      </div>

      <main id="main-content">
        <Hero />
        <Marquee />
        <About />
        <Journey />
        <Achievements />
        <Capabilities />
        <Projects />
        <Contact />
      </main>
      <Footer />
      {eggEverOpened && (
        <Suspense fallback={null}>
          <EasterEggOverlay
            open={egg !== null}
            onClose={closeEgg}
            title={egg ? EGG_COPY[egg].title : ""}
            message={egg ? EGG_COPY[egg].message : ""}
          />
        </Suspense>
      )}
      {paletteEverOpened && (
        <Suspense fallback={null}>
          <CommandPalette open={paletteOpen} onClose={closePalette} onToast={showToast} />
        </Suspense>
      )}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-6 z-[90] flex justify-center"
      >
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="rounded-full border border-line bg-panel px-4 py-2 font-mono text-xs text-ink shadow-lg"
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
