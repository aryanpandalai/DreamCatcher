/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary-color)', // Using the CSS variable
        customClay: 'hsl(15 63.1% 59.6%)',      // Or define a hex color directly
        customPurple: 'hsl(251 84.6% 74.5%)',
        constantSlate: 'hsl(50 11.5% 79.6%)',
        accentPro: {
          0: 'hsl(251, 84.6%, 74.5%)',
          100: 'hsl(251, 40.2%, 54.1%)',
          200: 'hsl(251, 40%, 45.1%)',
          900: 'hsl(250, 25.3%, 19.4%)',
          bg: {
            0: 'var(--constant-slate-700)',
            100: 'var(--constant-slate-750)',
            200: 'var(--constant-slate-800)',
            300: 'var(--constant-slate-850)',
            400: 'var(--constant-slate-900)',
            500: 'var(--constant-slate-950)',
          },
        },
      },
      fontFamily: {
        copernicus: ['Copernicus', 'serif'], // Add the custom font
      },
      transitionProperty: {
        height: 'height',              // Custom transition for height
        spacing: 'margin, padding',    // Custom transition for spacing
      },
      transitionTimingFunction: {
        'in-expo': 'cubic-bezier(0.95, 0.05, 0.795, 0.035)', // Custom easing
      },
      transitionDuration: {
        400: '400ms',                  // Custom duration
        800: '800ms',
      },
    },
  },
  plugins: [],
};
