import { Roboto } from "next/font/google";
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/utilities/**/*.{js,ts,jsx,tsx,mdx}",
  ],safelist: [
    "text-blue","bg-blue",
    "text-strawberry", "bg-strawberry",
    "text-royal", "bg-royal",
    "text-coffee", "bg-coffee",
    "text-lavander", "bg-lavander",
    "text-grass", "bg-grass",
   
  ],
  theme: {
    colors: {
      "bgcbody": "#EDF1F5",
      "graynav": "#2b2d42",
      "txnav": "#bbbedc",
      "hovnav":"#d3d5f3",
      "royal": "#3577FF",
      "placeh": "#b1c3d4",
      "txtcard": "#748899",
      "txtcatg": "#647380",
      "viewall": "#8ba0b2",
      "lead": "#516170",
      "bglanding": "#0a1625",
      "mjtitleldg": "#f0f3f6",
      "titleldg": "#ecf6fe",
      "spanldg": "#acd5f2;",
      "white": "#ffffff",
      "blue": "#3DB4F2",
      "singletxt":'#7A858F',
      "strawberry": "#EC294B",
      "titlesec": "#5C728A",
      "footerbg" : "#11161d",
      "footertxt": "#A0B1C5",
      "bordersq" : "#46546b",
      "coffee" : "#8a2c0f",
      "mustard" : "#ebb62d",
      "grass": "#2e8b57",
      "lavander": "#967BB6",
      "fucsia": "#8B008B",
      "sectionbtncl" : "#f7fafc",
      "sectioncircle" : "#d9e6ff",
      "chevroncol" : "#ADC0D2" ,
      "bgsection": "#FAFAFA",
    },
    extend: {
      boxShadow: {
        'filter': '0 14px 30px rgba(103,132,187,.1), 0 4px 4px rgba(103,132,187,.04)',
        'badgefilter':'0 14px 30px rgba(103, 132, 187,.15),0 4px 4px rgba(103, 132, 187),.05)',
        'filterblue' : '0 2px 43px rgba(8, 150, 230, .6)',
        'sdcover':'rgba(0, 0, 0, 0.5)' ,
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      fontFamily: {
        'roboto':['"Roboto"']
      },
     
    },
  },
  plugins: [],
};
export default config;
