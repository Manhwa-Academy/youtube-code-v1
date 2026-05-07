"use client";

import { useState, useEffect } from "react";

export const ScrollToTopCharacter = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const container = document.getElementById("main-scroll-container");
    
    const handleScroll = () => {
      if (container) {
        setShow(container.scrollTop > 300);
      } else {
        setShow(window.scrollY > 300);
      }
    };

    if (container) {
      container.addEventListener("scroll", handleScroll);
    }
    window.addEventListener("scroll", handleScroll);

    return () => {
      if (container) container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    const container = document.getElementById("main-scroll-container");
    if (container) {
      container.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div>
      {show && (
        <div
          className="fixed right-2 cursor-pointer z-0 transition-all duration-300 hover:scale-110 bottom-32 sm:bottom-4 sm:right-4 md:z-30"
          onClick={scrollToTop}
        >
          <img
            src="/characters/char_full.png"
            alt="Nhân vật lên đầu"
            className="w-16 sm:w-24 md:w-32 h-auto"
          />
        </div>
      )}
      {!show && (
        <div className="fixed right-0 z-0 bottom-24 sm:bottom-0 md:z-30">
          <img
            src="/characters/char_peek.png"
            alt="Nhân vật nửa ẩn"
            className="w-12 sm:w-20 md:w-24 h-auto opacity-90"
          />
        </div>
      )}
    </div>
  );
};
