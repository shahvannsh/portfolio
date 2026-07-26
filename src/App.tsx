import HUDTicker from "./components/HUDTicker";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Marquee from "./components/Marquee";
import About from "./components/About";
import Journey from "./components/Journey";
import Capabilities from "./components/Capabilities";
import Projects from "./components/Projects";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="min-h-screen bg-void text-ink">
      <HUDTicker />
      <Navbar />
      <Hero />
      <Marquee />
      <About />
      <Journey />
      <Capabilities />
      <Projects />
      <Contact />
      <Footer />
    </div>
  );
}

export default App;
