module.exports = {
  content: ["./index.html", "./assets/js/**/*.js"],
  theme: {
    extend: {
      colors: {
        primary: "#3b2416",
        accent: "#c8752b",
        "accent-light": "#f2b36d",
        "accent-text": "#8f4f12",
        background: "#f5ebdd",
        "background-dark": "#2a190e",
        surface: "#ffffff",
        text: "#3b2416",
        muted: "#6b5446",
        line: "color-mix(in srgb, #6b5446 24%, transparent)",
        success: "#2f6b40",
        warning: "#8a5a0c",
        error: "#b3261e",
        "divider-on-dark": "rgba(245, 235, 221, 0.15)",
      },
      fontFamily: {
        heading: ["Instrument Serif", "Georgia", "serif"],
        body: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
      borderRadius: {
        button: "12px",
        field: "12px",
        card: "20px",
        tag: "999px",
      },
    },
  },
};
