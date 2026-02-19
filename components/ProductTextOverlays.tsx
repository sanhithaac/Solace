"use client";

import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Product } from "@/data/products";

import { MotionValue } from "framer-motion";

interface ProductTextOverlaysProps {
    product: Product;
    scrollYProgress: MotionValue<number>;
}

const ProductTextOverlays: React.FC<ProductTextOverlaysProps> = ({ product, scrollYProgress }) => {

    // Opacity transforms for each section - Cleaner ranges with Zero-overlap buffers
    const opacity1 = useTransform(scrollYProgress, [0, 0.05, 0.15, 0.2], [0, 1, 1, 0]);
    const opacity2 = useTransform(scrollYProgress, [0.25, 0.3, 0.45, 0.5], [0, 1, 1, 0]);
    const opacity3 = useTransform(scrollYProgress, [0.55, 0.6, 0.75, 0.8], [0, 1, 1, 0]);
    const opacity4 = useTransform(scrollYProgress, [0.85, 0.9, 1], [0, 1, 1]);

    const y1 = useTransform(scrollYProgress, [0, 0.05, 0.15, 0.2], [50, 0, 0, -50]);
    const y2 = useTransform(scrollYProgress, [0.25, 0.3, 0.45, 0.5], [50, 0, 0, -50]);
    const y3 = useTransform(scrollYProgress, [0.55, 0.6, 0.75, 0.8], [50, 0, 0, -50]);
    const y4 = useTransform(scrollYProgress, [0.85, 0.9, 1], [50, 0, 0]);


    return (
        <div className="fixed inset-0 pointer-events-none z-10 flex flex-col items-center justify-center p-6 text-center">
            {/* Section 1 */}
            <motion.div style={{ opacity: opacity1, y: y1 }} className="absolute max-w-4xl">
                <h1 className="text-6xl md:text-8xl font-black mb-4 tracking-tighter">
                    {product.section1.title}
                </h1>
                <p className="text-xl md:text-3xl font-light opacity-80 italic">
                    {product.section1.subtitle}
                </p>
            </motion.div>

            {/* Section 2 */}
            <motion.div style={{ opacity: opacity2, y: y2 }} className="absolute max-w-4xl">
                <h2 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                    {product.section2.title}
                </h2>
                <p className="text-lg md:text-2xl font-light max-w-2xl mx-auto">
                    {product.section2.subtitle}
                </p>
            </motion.div>

            {/* Section 3 */}
            <motion.div style={{ opacity: opacity3, y: y3 }} className="absolute max-w-4xl">
                <h2 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                    {product.section3.title}
                </h2>
                <p className="text-lg md:text-2xl font-light max-w-2xl mx-auto">
                    {product.section3.subtitle}
                </p>
            </motion.div>

            {/* Section 4 */}
            <motion.div style={{ opacity: opacity4, y: y4 }} className="absolute max-w-4xl">
                <h2 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                    {product.section4.title}
                </h2>
                <p className="text-lg md:text-2xl font-light max-w-2xl mx-auto">
                    {product.section4.subtitle}
                </p>
            </motion.div>
        </div>
    );
};

export default ProductTextOverlays;
