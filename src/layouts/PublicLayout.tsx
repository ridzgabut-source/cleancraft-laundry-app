import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Navbar } from "../components/common/Navbar";
import { Footer } from "../components/common/Footer";
export function PublicLayout() {
  const { pathname, hash } = useLocation();
  const reduced = useReducedMotion();
  useEffect(() => {
    if (hash) {
      const timer = window.setTimeout(
        () => document.getElementById(hash.slice(1))?.scrollIntoView(),
        100,
      );
      return () => window.clearTimeout(timer);
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname, hash]);
  return (
    <div id="top" className="public-shell">
      <a className="skip-link" href="#main-content">
        Langsung ke konten
      </a>
      <Navbar />
      <motion.main
        id="main-content"
        key={pathname}
        initial={reduced ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={pathname === "/" ? "public-main" : "public-main inner-page"}
      >
        <Outlet />
      </motion.main>
      <Footer />
    </div>
  );
}
