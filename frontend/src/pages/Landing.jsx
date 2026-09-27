import React, { useEffect, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Preloader from "../components/Preloader";
import Hero from "../sections/Hero";
import About from "../sections/About";
import VisionMission from "../sections/VisionMission";
import CoreValues from "../sections/CoreValues";
import ProductGallery from "../sections/ProductGallery";
import RealEstate from "../sections/RealEstate";
import ClientsPartners from "../sections/ClientsPartners";
import Credentials from "../sections/Credentials";
import Contact from "../sections/Contact";

const Wave = ({ flip = false, fill = "var(--bg-alt)" }) => (
  <svg
    className="wave-divider"
    viewBox="0 0 1440 90"
    preserveAspectRatio="none"
    style={flip ? { transform: "scaleY(-1)" } : {}}
    aria-hidden="true"
  >
    <path d="M0,60 C360,110 720,0 1080,40 C1260,60 1380,50 1440,30 L1440,90 L0,90 Z" fill={fill} />
  </svg>
);

export default function Landing() {
  const [introDone, setIntroDone] = useState(() => sessionStorage.getItem("hesi-intro") === "1");

  useEffect(() => {
    if (introDone) {
      const t = setTimeout(() => ScrollTrigger.refresh(), 300);
      return () => clearTimeout(t);
    }
  }, [introDone]);

  const finishIntro = () => {
    sessionStorage.setItem("hesi-intro", "1");
    setIntroDone(true);
  };

  return (
    <div data-testid="landing-page">
      {!introDone && <Preloader onDone={finishIntro} />}
      {introDone && (
        <>
          <Navbar />
          <main>
            <Hero />
            <About />
            <Wave />
            <VisionMission />
            <Wave flip fill="var(--bg)" />
            <CoreValues />
            <ProductGallery />
            <RealEstate />
            <ClientsPartners />
            <Credentials />
            <Wave />
            <Contact />
          </main>
          <Footer />
        </>
      )}
    </div>
  );
}
