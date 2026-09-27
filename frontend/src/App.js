import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { ThemeProvider, CartProvider, AuthProvider } from "./context/AppContext";
import Cursor from "./components/Cursor";
import FloatingInquire from "./components/FloatingInquire";
import Landing from "./pages/Landing";
import InquiryCenter from "./pages/InquiryCenter";
import MyInquiries from "./pages/MyInquiries";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

gsap.registerPlugin(ScrollTrigger);

function ScrollManager() {
  const location = useLocation();
  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        const el = document.querySelector(location.hash);
        if (el) {
          if (window.__lenis) window.__lenis.scrollTo(el, { offset: -70, duration: 1.4 });
          else el.scrollIntoView({ behavior: "smooth" });
        }
      }, 600);
    } else {
      window.scrollTo(0, 0);
      if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true });
    }
    setTimeout(() => ScrollTrigger.refresh(), 500);
  }, [location.pathname, location.hash]);
  return null;
}

function App() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      window.__lenis = null;
    };
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <div className="App grain">
            <BrowserRouter>
              <ScrollManager />
              <Cursor />
              <FloatingInquire />
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/inquire" element={<InquiryCenter />} />
                <Route path="/track" element={<MyInquiries />} />
                <Route path="/admin" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
              </Routes>
              <Toaster position="top-center" richColors theme="dark" />
            </BrowserRouter>
          </div>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
