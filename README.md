# Cement Plant CO₂ Emission Reporter

A web-based application that calculates and reports CO₂ emissions from cement plants in line with the **CSI/GCCA CO₂ and Energy Protocol**.
This project was developed as part of an academic thesis to support standardized, transparent, and verifiable greenhouse gas reporting for the cement industry in Indonesia.

🌐 **Live demo:** [cement-plant-co2-emission-reporter.vercel.app](https://cement-plant-co2-emission-reporter.vercel.app/)

---

## Features

* **Excel upload:** Import `.xlsx` production data for one or multiple plants.
* **Automatic calculation:** Scope 1 process emissions (B1 method), fuel combustion, and electricity-related emissions.
* **Monthly and annual aggregation:** Results grouped by plant and year, with monthly breakdowns.
* **Interactive charts:** Visualize emissions across months with grouped line or bar charts.
* **Export options:** Download results as CSV, XLSX, or PDF (with standardized report layout).
* **Configurable emission factors:** Update and recalculate using custom factors.
* **MRV-ready outputs:** Reports designed to support audit and compliance with carbon-trading regulations.

---

## Methodology

The application follows the **CSI/GCCA CO₂ & Energy Protocol (2011 edition)**.

* **Process emissions (Scope 1):** Calculated using the **B1 method** with clinker production and default emission factors.
* **Fuel emissions (Scope 1):** Based on kiln fuel energy content and standard emission factors.
* **Electricity emissions (Scope 2, optional):** Based on electricity consumption (MWh) and grid emission factor.
* **Units and factors:** All inputs and outputs are standardized for reproducibility and MRV compliance.

---

## Tech Stack

* [Next.js 14 (App Router)](https://nextjs.org/)
* [TypeScript](https://www.typescriptlang.org/)
* [Tailwind CSS](https://tailwindcss.com/)
* [SheetJS](https://github.com/SheetJS/sheetjs) (Excel import/export)
* [Recharts](https://recharts.org/) (charts)
* [jsPDF](https://github.com/parallax/jsPDF) + [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable) (PDF export)

Deployment: [Vercel](https://vercel.com/)

---

## Project Structure

```
src/
├─ app/
│  ├─ api/health/route.ts    # Health check endpoint
│  ├─ globals.css            # Tailwind base styles
│  ├─ layout.tsx             # App layout
│  └─ page.tsx               # Main page (upload → factors → results → export flow)
├─ components/               # React UI components
│  ├─ Dropzone.tsx
│  ├─ FactorsPanel.tsx
│  ├─ ResultsTable.tsx
│  ├─ SummaryCards.tsx
│  └─ MonthlyChart.tsx
├─ lib/                      # Core logic
│  ├─ parser.ts              # Parse and validate Excel files
│  ├─ csi.ts                 # Emission calculations (B1, factors)
│  ├─ aggregate.ts           # Monthly & annual aggregation
│  ├─ export.ts              # Export to CSV/XLSX/PDF
│  ├─ schema.ts              # Zod schemas for input validation
│  └─ utils.ts               # Helpers
├─ types.ts                  # Type definitions
└─ public/sample.xlsx        # Input template
```

---

## Getting Started

### Prerequisites

* Node.js 18+
* npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/co2-reporter.git
cd co2-reporter

# Install dependencies
npm install

# Run locally
npm run dev

# Build for production
npm run build
npm start
```

---

## 📥 Input Template

Plants should prepare an Excel file (`.xlsx`) with the following fields:

| Plant   | Date (YYYY-MM-DD) | Clinker\_t | KilnFuel\_GJ | Electricity\_MWh |
| ------- | ----------------- | ---------- | ------------ | ---------------- |
| Plant A | 2022-01-31        | 50000      | 25000        | 1200             |

👉 A ready-to-use [sample template](./public/sample.xlsx) is included.
