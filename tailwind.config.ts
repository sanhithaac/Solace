import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                outfit: ["var(--font-outfit)", "sans-serif"],
            },
            colors: {
                brand: {
                    orange: "#FFB74D",
                    pink: "#FF8A80",
                    chocolate: "#8D6E63",
                    ruby: "#E57373",
                },
            },
        },
    },
    plugins: [],
};
export default config;
