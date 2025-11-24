/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Upshift brand colors
        'upshift-blue': '#2563eb',      // Primary blue
        'upshift-cyan': '#0891b2',      // Primary cyan
        'upshift-amber': '#f59e0b',     // Accent amber
        'upshift-green': '#10b981',     // Success green
      },
      backgroundImage: {
        'upshift-gradient': 'linear-gradient(135deg, #2563eb 0%, #0891b2 100%)',
      },
    },
  },
  plugins: [],
};
