"use client";

import React, { useRef, useEffect, useState } from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import { Product } from "@/data/products";

import { MotionValue } from "framer-motion";

interface ProductBottleScrollProps {
    product: Product;
    scrollYProgress: MotionValue<number>;
}

const ProductBottleScroll: React.FC<ProductBottleScrollProps> = ({ product, scrollYProgress }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [images, setImages] = useState<HTMLImageElement[]>([]);

    // For the chocolate product, we have 192 frames. For others, we assume 120.
    const frameCount = product.id === "chocolate" ? 192 : 120;
    const extension = product.id === "chocolate" ? "jpg" : "webp";


    // Load images
    useEffect(() => {
        const loadedImages: HTMLImageElement[] = [];
        let loadedCount = 0;

        for (let i = 1; i <= frameCount; i++) {
            const img = new Image();
            img.src = `${product.folderPath}/${i}.${extension}`;
            img.onload = () => {
                loadedCount++;
                if (loadedCount === frameCount) {
                    // All images loaded
                }
            };
            loadedImages.push(img);
        }
        setImages(loadedImages);
    }, [product, frameCount, extension]);

    // Current frame based on scroll
    const currentFrame = useTransform(scrollYProgress, [0, 1], [0, frameCount - 1]);

    // Draw to canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || images.length === 0) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        const render = () => {
            if (!currentFrame) return;
            const frameIndex = Math.floor(currentFrame.get());
            const img = images[frameIndex];

            if (img && img.complete) {
                // Clear canvas
                context.clearRect(0, 0, canvas.width, canvas.height);

                // Aspect ratio contain logic
                const canvasAspect = canvas.width / canvas.height;
                const imgAspect = img.width / img.height;

                let drawWidth, drawHeight, offsetX, offsetY;

                if (canvasAspect > imgAspect) {
                    drawHeight = canvas.height;
                    drawWidth = canvas.height * imgAspect;
                    offsetX = (canvas.width - drawWidth) / 2;
                    offsetY = 0;
                } else {
                    drawWidth = canvas.width;
                    drawHeight = canvas.width / imgAspect;
                    offsetX = 0;
                    offsetY = (canvas.height - drawHeight) / 2;
                }

                context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
            }
            requestAnimationFrame(render);
        };

        const animationId = requestAnimationFrame(render);
        return () => cancelAnimationFrame(animationId);
    }, [images, currentFrame]);

    // Handle Resize
    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current) {
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight;
            }
        };

        window.addEventListener("resize", handleResize);
        handleResize();
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
            <canvas
                ref={canvasRef}
                className="w-full h-full object-contain pointer-events-none"
            />
        </div>
    );
};

export default ProductBottleScroll;
