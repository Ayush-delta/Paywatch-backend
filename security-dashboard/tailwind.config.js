export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                slate: {
                    850: "#1e293b", // Custom dark slate
                    900: "#0f172a", // Standard
                    950: "#020617", // Ultra dark
                },
            },
            fontFamily: {
                sans: ["Inter", "sans-serif"],
            },
        },
    },
    plugins: [],
}
