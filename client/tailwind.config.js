module.exports = {
  purge: {
    content: ["./index.html", "./src/css/index.css", "./src/**/*.js"],
    options: {
      safelist: [
        "rdt_Table",
        "rdt_TableRow",
        "rdt_TableCol",
        "rdt_TableCol_Sortable",
        "rdt_TableCell",
        "rdt_TableFooter",
        "rdt_TableHead",
        "rdt_TableHeadRow",
        "rdt_TableBody",
        "rdt_TableExpanderRow",
        "rdt_Pagination",
      ],
    },
  },
  theme: {
    extend: {
      transitionProperty: {
        "max-height": "max-height",
      },
      colors: {
        cyan: {
          DEFAULT: "#69ebf4",
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require("@tailwindcss/forms")],
};
