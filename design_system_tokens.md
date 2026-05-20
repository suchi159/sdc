# SecureProctor AI - Design System Tokens

These are the core Material Design 3 (MD3) CSS tokens currently powering the application's aesthetic.

## Light Mode Colors

```css
:root {
  /* Core Brand Colors */
  --pri: #f9ad00;          /* Primary Amber/Orange */
  --pri-dk: #7a4e00;       /* Primary Dark */
  --pri-ct: #000000;       /* Primary Contrast */
  --pri-con: #fff8e6;      /* Primary Container */
  --pri-con-ct: #7a4e00;   /* Primary Container Contrast */

  /* Secondary & Tertiary */
  --sec: #6750a4;          /* Secondary Purple */
  --sec-ct: #ffffff;
  --ter: #625b71;          /* Tertiary Gray/Slate */
  --ter-ct: #ffffff;

  /* Semantic Feedback Colors */
  --err: #b3261e;          /* Error Red */
  --err-ct: #ffffff;
  --suc: #146c2e;          /* Success Green */
  --suc-ct: #ffffff;
  --wrn: #7d5700;          /* Warning Yellow/Gold */
  --wrn-ct: #ffffff;
  --inf: #00639b;          /* Info Blue */
  --inf-ct: #ffffff;
  
  /* Surfaces & Outlines */
  --sur: #ffffff;          /* Surface White */
  --sur-var: #f3edf7;      /* Surface Variant (Light Gray/Purple tint) */
  --out: #5d5962;          /* Outline */
  --out-var: #8e8a94;      /* Outline Variant */
  
  /* Typography / On-Surface Colors */
  --on-sur: #1c1b1f;       /* Primary Text (Nearly Black) */
  --on-sur-var: #49454f;   /* Secondary Text */
  --on-pri: #000000;       /* Text on Primary Background */
}
```

## Dark Mode Colors

```css
html[data-t="dark"] {
  /* Core Brand Colors */
  --pri: #ffb951;          /* Vibrant Amber/Orange */
  --pri-dk: #ffedaa;       /* Light Amber */
  --pri-ct: #000000;       /* Primary Contrast */
  --pri-con: #ffedaa;      /* Primary Container */
  --pri-con-ct: #1c1100;   /* Primary Container Contrast */

  /* Secondary & Tertiary */
  --sec: #cbb9f9;          /* Light Lavender/Purple */
  --sec-ct: #371e73;
  --ter: #cbbfdc;          /* Soft Slate/Gray */
  --ter-ct: #322942;

  /* Semantic Feedback Colors */
  --err: #f2b8b5;          /* Light Error Red */
  --err-ct: #601410;
  --suc: #6dd58c;          /* Light Success Green */
  --suc-ct: #003917;
  --wrn: #ffb945;          /* Light Warning Yellow */
  --wrn-ct: #3c2800;
  --inf: #7fcfff;          /* Light Info Blue */
  --inf-ct: #003350;
  
  /* Surfaces & Outlines */
  --sur: #1c1b1f;          /* Dark Surface Background */
  --sur-var: #2b2930;      /* Elevated Dark Surface */
  --out: #a7a3b0;          /* Outline */
  --out-var: #615e6b;      /* Outline Variant */
  
  /* Typography / On-Surface Colors */
  --on-sur: #e6e1e5;       /* Primary Text (Nearly White) */
  --on-sur-var: #cac4d0;   /* Secondary Text */
  --on-pri: #000000;       /* Text on Primary Background */
}
```
