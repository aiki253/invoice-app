# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Japanese Invoice Generator - a React web application for creating, customizing, and exporting professional invoices with full Japanese business localization support (インボイス制度).

## Development Commands

```bash
npm run dev       # Start Vite dev server with HMR
npm run build     # Production build to dist/
npm run lint      # Run ESLint
npm run preview   # Preview production build
```

## Architecture

**Component Structure:**
- `App.jsx` → `InvoiceTemplate.jsx` → `InvoicePDF.jsx`

**InvoiceTemplate.jsx** (362 lines): Main stateful component handling:
- Invoice form state (issueDate, recipient, sender, bankInfo, items, accountInfo)
- LocalStorage persistence (`invoice_data`, `invoice_showReg` keys)
- PDF export via @react-pdf/renderer
- PNG export via pdfjs-dist + canvas rendering (3x scale)

**InvoicePDF.jsx** (442 lines): Presentational PDF component using @react-pdf/renderer StyleSheets

**Data Flow:**
- Form inputs update React state
- State auto-saves to localStorage on change
- Export functions generate PDF blob, then either download directly (PDF) or convert to PNG via canvas

## Key Technical Details

- **PDF Japanese Font**: IPA Gothic loaded from `/public/fonts/ipag.ttf`, registered in InvoicePDF.jsx
- **PDF.js Worker**: Configured at `/pdf.worker.min.mjs` (line 9 in InvoiceTemplate.jsx)
- **Mobile Export**: Uses Web Share API for PNG sharing on mobile devices
- **Styling**: Tailwind CSS with A4 paper simulation (210mm width), mobile-first responsive design

## LocalStorage Schema

```javascript
{
  issueDate: string,           // "2026年 01月01日"
  recipient: string,           // Company name with 御中 suffix
  sender: { name, zip, address, regNumber },
  bankInfo: { bankName, type, number, holder },
  items: [{ id, date, content, quantity, unit, price }],
  accountInfo: { name, id }
}
```
