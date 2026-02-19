"use client";

import React from "react";
import { Coffee, Instagram, Twitter, Facebook } from "lucide-react";

const Footer = () => {
    return (
        <footer className="bg-neutral-950 text-white py-20 border-t border-white/5">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
                    <div className="col-span-1 md:col-span-1">
                        <h3 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-pink-500 mb-6 italic">
                            NANO BANANA
                        </h3>
                        <p className="text-white/50 leading-relaxed mb-8">
                            We're on a mission to bring the future of freshness to your doorstep. Cold-pressed, never heated, and always 100% natural.
                        </p>
                        <div className="flex gap-4">
                            <Instagram className="w-5 h-5 text-white/50 hover:text-white cursor-pointer transition-colors" />
                            <Twitter className="w-5 h-5 text-white/50 hover:text-white cursor-pointer transition-colors" />
                            <Facebook className="w-5 h-5 text-white/50 hover:text-white cursor-pointer transition-colors" />
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xs uppercase tracking-widest font-bold mb-6 text-white/30">Shop</h4>
                        <ul className="space-y-4 text-sm font-medium">
                            <li><a href="#" className="text-white/60 hover:text-white transition-colors">All Juices</a></li>
                            <li><a href="#" className="text-white/60 hover:text-white transition-colors">Cleanse Sets</a></li>
                            <li><a href="#" className="text-white/60 hover:text-white transition-colors">Subscriptions</a></li>
                            <li><a href="#" className="text-white/60 hover:text-white transition-colors">Gift Cards</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-xs uppercase tracking-widest font-bold mb-6 text-white/30">Support</h4>
                        <ul className="space-y-4 text-sm font-medium">
                            <li><a href="#" className="text-white/60 hover:text-white transition-colors">Shipping</a></li>
                            <li><a href="#" className="text-white/60 hover:text-white transition-colors">Returns</a></li>
                            <li><a href="#" className="text-white/60 hover:text-white transition-colors">FAQ</a></li>
                            <li><a href="#" className="text-white/60 hover:text-white transition-colors">Contact Us</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-xs uppercase tracking-widest font-bold mb-6 text-white/30">Join the Lab</h4>
                        <p className="text-sm text-white/50 mb-6 leading-relaxed">
                            Subscribe for exclusive drops and limited nutritional insights.
                        </p>
                        <form className="flex">
                            <input
                                type="email"
                                placeholder="Email address"
                                className="bg-white/5 border border-white/10 px-4 py-2 text-sm w-full focus:outline-none focus:border-orange-500 transition-colors"
                            />
                            <button className="bg-white text-black px-6 py-2 text-sm font-bold hover:bg-orange-500 hover:text-white transition-colors">
                                Join
                            </button>
                        </form>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 text-[10px] uppercase tracking-widest font-bold text-white/20 gap-4">
                    <p>© 2024 Nano Banana Corp. All rights reserved.</p>
                    <div className="flex gap-8">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
