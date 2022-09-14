module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    fontFamily: {
      // sans: ['ui-sans-serif', 'Helvetica', 'system-ui'],
      // serif: ['ui-serif', 'Garamond', 'Georgia'],
      // mono: ['ui-monospace', 'FreeMono', 'SFMono-Regular'],
      sans: ['Inter', 'Inter UI', 'San Francisco', 'Helvetica Neue', 'Arial', 'sans-serif'],
      mono: ['Source Code Pro', 'Roboto mono', 'Courier New', 'monospace'],
    },
    // key:
    // - fg/bg: foreground/background
    // - p/s: primary/secondary
    // - 1/2: option 1/option 2
    // colors: { // sphinx palette
    //   fgp1: '#4C3A51',
    //   fgp2: 'green',
    //   fgs1: 'orange',
    //   fgs2: 'blue',
    //   bgp1: '#FAEDE3',
    //   bgp2: '#E7AB79',
    //   bgs1: '#B25068',
    //   bgs2: '#774360',
    // },
    colors: { // solarized light palette
      fgp1: '#586E75',
      fgp2: '#859900',
      fgs1: '#CB4B16',
      fgs2: '#268BD2',
      bgp1: '#FDF6E3',
      bgp2: '#EEE8D5',
      bgs1: '#93A1A1',
      bgs2: '#657B83',
    },
    // colors: { // solarized dark palette
    //   fgp1: '#93A1A1',
    //   fgp2: '#859900',
    //   fgs1: '#CB4B16',
    //   fgs2: '#268BD2',
    //   bgp1: '#002B36',
    //   bgp2: '#073642',
    //   bgs1: '#586E75',
    //   bgs2: '#839496',
    // },
    // colors: { // nord palette
    //   fgp1: '#3B4252',
    //   fgp2: '#8FBCBB',
    //   fgs1: '#D08770',
    //   fgs2: '#5E81AC',
    //   bgp1: '#ECEFF4',
    //   bgp2: '#D8DEE9',
    //   bgs1: '#88C0D0',
    //   bgs2: '#5E81AC',
    // },
  },
  screens: {},
  plugins: [
    require('tailwindcss-labeled-groups')(['1', '2', '3'])
  ]
};
