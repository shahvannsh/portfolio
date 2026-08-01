import { useCallback, useState } from "react";
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
import EasterEggOverlay from "./components/EasterEggOverlay";
import CommandPalette from "./components/CommandPalette";
import { useKonamiCode } from "./hooks/useKonamiCode";
import { useClickCombo } from "./hooks/useClickCombo";
import { useCommandPaletteShortcut } from "./hooks/useCommandPaletteShortcut";

type EggKind = "konami" | "logo" | null;

const EGG_COPY: Record<Exclude<EggKind, null>, { title: string; message: string }> = {
  konami: {
    title: "Konami Protocol Unlocked",
    message: "Thirty lives, one nostalgia hit. You know the code — you probably also read READMEs. Respect.",
  },
  logo: {
    title: "Signal Traced",
    message: "Five clicks on the logo and you found the hidden channel. Curiosity like that is basically a job requirement in this field.",
  },
};

function App() {
  const [egg, setEgg] = useState<EggKind>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const triggerKonami = useCallback(() => setEgg("konami"), []);
  const triggerLogo = useCallback(() => setEgg("logo"), []);
  const closeEgg = useCallback(() => setEgg(null), []);
  const openPalette = useCallback(() => setPaletteOpen(true), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);

  useKonamiCode(triggerKonami);
  const handleLogoClick = useClickCombo(triggerLogo);
  useCommandPaletteShortcut(openPalette);

  return (
    <div className="min-h-screen bg-void text-ink">
      <CursorTrail />
      <HUDTicker />
      <Navbar onLogoClick={handleLogoClick} onOpenPalette={openPalette} />
      <main>
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
      <EasterEggOverlay
        open={egg !== null}
        onClose={closeEgg}
        title={egg ? EGG_COPY[egg].title : ""}
        message={egg ? EGG_COPY[egg].message : ""}
      />
      <CommandPalette open={paletteOpen} onClose={closePalette} />
    </div>
  );
}

export default App;
