"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { products } from "@/data/products";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductBottleScroll from "@/components/ProductBottleScroll";
import ProductTextOverlays from "@/components/ProductTextOverlays";
import { ChevronLeft, ChevronRight, ShoppingCart, CheckCircle2 } from "lucide-react";

import { useRef } from "react";
import { useScroll } from "framer-motion";

export default function Home() {
    const scrollyContainerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: scrollyContainerRef,
        offset: ["start start", "end end"],
    });

    const [currentIndex, setCurrentIndex] = useState(0); // Only one product now
    const product = products[currentIndex];

    useEffect(() => {
        // Reset scroll when product changes
        window.scrollTo(0, 0);
        // Update theme color
        document.documentElement.style.setProperty("--product-gradient", product.gradient);
    }, [currentIndex, product]);

    const nextProduct = () => {
        setCurrentIndex((prev) => (prev + 1) % products.length);
    };

    const prevProduct = () => {
        setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
    };

    return (
        <main className="min-h-screen">
            <Navbar />

            <AnimatePresence mode="wait">
                <motion.div
                    key={product.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    {/* Hero Scrollytelling Section */}
                    <section ref={scrollyContainerRef} className="relative h-[600vh] w-full">
                        <ProductBottleScroll product={product} scrollYProgress={scrollYProgress} />
                        <ProductTextOverlays product={product} scrollYProgress={scrollYProgress} />
                    </section>


                    {/* Details Section */}
                    <section className="relative z-20 py-32 bg-black/20 backdrop-blur-sm">
                        <div className="container mx-auto px-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
                                <motion.div
                                    initial={{ opacity: 0, x: -50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                >
                                    <h3 className="text-sm font-black uppercase tracking-[0.3em] text-orange-500 mb-6">
                                        Deep Dive
                                    </h3>
                                    <h2 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
                                        {product.detailsSection.title}
                                    </h2>
                                    <p className="text-xl text-white/60 leading-relaxed mb-10">
                                        {product.detailsSection.description}
                                    </p>
                                    <div className="flex gap-12">
                                        {product.stats.map((stat) => (
                                            <div key={stat.label}>
                                                <div className="text-4xl font-bold mb-1">{stat.val}</div>
                                                <div className="text-xs uppercase tracking-widest text-white/30 font-black">{stat.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    className="aspect-square bg-white/5 rounded-3xl border border-white/10 flex items-center justify-center p-12 overflow-hidden"
                                >
                                    <img
                                        src={product.id === "chocolate" ? "/images/chocolate/1.jpg" : product.id === "mango" ? "https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=1000&auto=format&fit=crop" : "https://images.unsplash.com/photo-1541345023926-55d6e08bb369?q=80&w=1000&auto=format&fit=crop"}
                                        alt={product.detailsSection.imageAlt}
                                        className="w-full h-full object-cover rounded-2xl grayscale hover:grayscale-0 transition-all duration-700 hover:scale-110"
                                    />
                                </motion.div>
                            </div>
                        </div>
                    </section>

                    {/* Freshness Section */}
                    <section className="relative z-20 py-32 border-t border-white/5">
                        <div className="container mx-auto px-6 max-w-4xl text-center">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                            >
                                <h2 className="text-4xl md:text-6xl font-bold mb-8 italic">
                                    {product.freshnessSection.title}
                                </h2>
                                <p className="text-xl md:text-2xl text-white/60 leading-relaxed">
                                    {product.freshnessSection.description}
                                </p>
                            </motion.div>
                        </div>
                    </section>

                    {/* Buy Now Section */}
                    <section className="relative z-20 py-32 bg-white text-black rounded-t-[5rem]">
                        <div className="container mx-auto px-6">
                            <div className="flex flex-col md:flex-row justify-between items-start gap-16">
                                <div className="flex-1">
                                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-orange-600 mb-6">
                                        Available Now
                                    </h3>
                                    <h2 className="text-6xl md:text-8xl font-black mb-8">
                                        Get it fresh.
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                                        {product.buyNowSection.processingParams.map((param) => (
                                            <div key={param} className="flex items-center gap-3">
                                                <CheckCircle2 className="text-orange-600 w-5 h-5" />
                                                <span className="font-bold uppercase text-xs tracking-widest">{param}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="w-full md:w-96 bg-neutral-100 p-8 rounded-4xl border border-black/5">
                                    <div className="flex justify-between items-end mb-8">
                                        <div>
                                            <div className="text-sm font-bold opacity-50 uppercase tracking-widest mb-1">One Pack</div>
                                            <div className="text-5xl font-black">{product.buyNowSection.price}</div>
                                        </div>
                                        <div className="text-xs font-bold opacity-50 mb-2 italic">{product.buyNowSection.unit}</div>
                                    </div>

                                    <button className="w-full py-6 bg-black text-white rounded-2xl font-black uppercase text-sm tracking-widest flex items-center justify-center gap-3 hover:bg-orange-600 transition-colors group mb-6">
                                        <ShoppingCart className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                        Add to Cart
                                    </button>

                                    <div className="space-y-4 text-[10px] uppercase tracking-widest font-black leading-relaxed opacity-40">
                                        <p>{product.buyNowSection.deliveryPromise}</p>
                                        <p>{product.buyNowSection.returnPolicy}</p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </section>
                </motion.div>
            </AnimatePresence>

            <Footer />
        </main>
    );
}
