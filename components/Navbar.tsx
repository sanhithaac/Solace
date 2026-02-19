"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled ? "py-4 bg-black/50 backdrop-blur-xl border-b border-white/10" : "py-8 bg-transparent"
                }`}
        >
            <div className="container mx-auto px-6 flex justify-between items-center">
                <div className="flex items-center gap-2 group cursor-pointer">
                    <svg
                        width="40"
                        height="40"
                        viewBox="0 0 40 40"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="group-hover:rotate-12 transition-transform duration-300"
                    >
                        <path
                            d="M20 5L25 15H15L20 5Z"
                            fill="url(#paint0_linear)"
                        />
                        <path
                            d="M20 35L15 25H25L20 35Z"
                            fill="url(#paint1_linear)"
                        />
                        <circle cx="20" cy="20" r="5" fill="#f97316" />
                        <defs>
                            <linearGradient id="paint0_linear" x1="15" y1="5" x2="25" y2="15" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#F97316" />
                                <stop offset="1" stopColor="#EC4899" />
                            </linearGradient>
                            <linearGradient id="paint1_linear" x1="15" y1="25" x2="25" y2="35" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#F97316" />
                                <stop offset="1" stopColor="#EC4899" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-pink-500 tracking-tighter">
                        NANO BANANA
                    </span>
                </div>

                <div className="hidden md:flex items-center gap-8 text-sm font-medium uppercase tracking-widest text-white/70">
                    <a href="#" className="hover:text-white transition-colors">Juices</a>
                    <a href="#" className="hover:text-white transition-colors">Our Story</a>
                    <a href="#" className="hover:text-white transition-colors">Pressery</a>
                </div>

                <button className="relative group overflow-hidden px-8 py-3 rounded-full bg-white text-black font-bold uppercase text-xs tracking-widest transition-all hover:scale-105 active:scale-95">
                    <span className="relative z-10 group-hover:text-white transition-colors duration-300">Order Now</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-pink-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </button>
            </div>
        </motion.nav>
    );
};

export default Navbar;
