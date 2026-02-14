# Mode AURA - Luxury Boutique System

This is the automated system for your shop at **785 Wyandotte St East, Windsor**.

## 📁 Project Structure (Organized)

```text
modeaura-web/
├── src/
│   ├── app/                # Main pages (Website & Dashboard)
│   ├── components/
│   │   ├── ui/             # Reusable gold buttons, glass cards, etc.
│   │   ├── website/        # Home page sections (Hero, Featured)
│   │   └── dashboard/      # Cashier-only components (Sales list, Inventory)
│   ├── lib/                # Database/API logic
│   ├── styles/             # Luxury CSS & Global theme
│   └── types/              # Data definitions (Products, Invoices)
└── tailwind.config.js      # Luxury brand color palette
```

## 🚀 How to Test & See

Follow these steps to see your website and dashboard live on your computer:

### 1. Open Terminal & Switch Drive
Open your terminal (PowerShell or Command Prompt). 

**First**, type this and press Enter:
```powershell
d:
```

**Second**, type exactly this (including the **cd** part) and press Enter:
```powershell
cd \Websites\modeaura\modeaura-web
```
*(Tip: Always type **cd** before a folder name to "Change Directory"!)*

### 2. Install Dependencies
Run this command to download the necessary pieces (React, Next.js, etc.):
```bash
npm install
```

### 3. Start the Shop
Run the development server:
```bash
npm run dev
```

### 4. Open in Browser
Once it is running, open your browser (Chrome/Edge) and go to:
- **Main Website**: `http://localhost:3000`
- **Cashier Dashboard**: `http://localhost:3000/dashboard`

---
*Created for Mode AURA - Style & Aura*
