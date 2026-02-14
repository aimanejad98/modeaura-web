'use client'

import { useEffect, useRef } from 'react'
import JsBarcode from 'jsbarcode'

interface BarcodeProps {
  value: string
  width?: number
  height?: number
  displayValue?: boolean
}

export default function Barcode({ value, width = 2, height = 50, displayValue = true }: BarcodeProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value, {
          format: 'CODE128',
          width,
          height,
          displayValue,
          fontSize: 12,
          margin: 5,
        })
      } catch (e) {
        console.error('Barcode generation failed:', e)
      }
    }
  }, [value, width, height, displayValue])

  return <svg ref={svgRef} />
}

export function printBarcode(sku: string, productName: string, price: number, size?: string, color?: string, material?: string) {
  const printWindow = window.open('', '_blank', 'width=600,height=400')
  if (!printWindow) return

  // Build attributes string
  const attributes = [size, color, material].filter(Boolean).join(' • ');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Product Label - ${sku}</title>
      <style>
        @page {
          size: 2in 1in;
          margin: 0;
        }
        * {
          box-sizing: border-box;
        }
        body { 
          font-family: 'Arial', sans-serif; 
          margin: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: #f0f0f0;
        }
        .label {
          width: 2in;
          height: 1in;
          background: white;
          padding: 0.08in;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border: 1px solid #ddd;
          position: relative;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 2px;
          border-bottom: 1px solid #000;
        }
        .brand {
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.8px;
          color: #000;
        }
        .price-top {
          font-size: 9px;
          font-weight: 700;
          color: #000;
        }
        .product-name {
          font-size: 7px;
          font-weight: 600;
          color: #000;
          line-height: 1.1;
          max-height: 14px;
          overflow: hidden;
          text-align: center;
          margin: 1px 0;
        }
        .attributes {
          font-size: 6px;
          color: #000;
          text-align: center;
          font-weight: 700;
          letter-spacing: 0.3px;
          margin: 1px 0;
          text-transform: uppercase;
        }
        .barcode-area {
          text-align: center;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .barcode {
          max-width: 100%;
        }
        .sku {
          font-size: 6px;
          color: #666;
          text-align: center;
          letter-spacing: 0.3px;
        }
        @media print {
          body { 
            background: white;
            min-height: 0;
          }
          .label {
            border: none;
          }
        }
      </style>
      <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
    </head>
    <body>
      <div class="label">
        <div class="header">
          <div class="brand">MODEAURA</div>
          <div class="price-top">$${price.toFixed(2)}</div>
        </div>
        
        <div class="product-name">${productName.length > 40 ? productName.substring(0, 37) + '...' : productName}</div>
        ${attributes ? `<div class="attributes">${attributes}</div>` : ''}
        
        <div class="barcode-area">
          <svg id="barcode" class="barcode"></svg>
        </div>
        
        <div class="sku">SKU: ${sku}</div>
      </div>
      <script>
        JsBarcode("#barcode", "${sku}", {
          format: "CODE128",
          width: 1.2,
          height: 28,
          displayValue: false,
          margin: 0,
          fontSize: 8
        });
        setTimeout(() => window.print(), 500);
      </script>
    </body>
    </html>
  `)
  printWindow.document.close()
}

// Bulk print multiple barcodes
export function printBulkBarcodes(products: Array<{ sku: string; name: string; price: number }>) {
  const printWindow = window.open('', '_blank', 'width=800,height=600')
  if (!printWindow) return

  const labelsHtml = products.map(p => `
    <div class="label">
      <div class="product-name">${p.name}</div>
      <svg id="barcode-${p.sku}" class="barcode"></svg>
      <div class="price">$${p.price.toFixed(2)}</div>
    </div>
  `).join('')

  const barcodeScripts = products.map(p => `
    JsBarcode("#barcode-${p.sku}", "${p.sku}", {
      format: "CODE128",
      width: 1.5,
      height: 40,
      displayValue: true,
      fontSize: 10,
      margin: 3
    });
  `).join('')

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Print Barcodes</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          padding: 10px;
          margin: 0;
        }
        .labels {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        .label {
          border: 1px dashed #ccc;
          padding: 10px;
          text-align: center;
        }
        .product-name {
          font-weight: bold;
          font-size: 11px;
          margin-bottom: 5px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .price {
          font-size: 14px;
          font-weight: bold;
          margin-top: 5px;
        }
        @media print {
          .label { border: 1px solid #eee; page-break-inside: avoid; }
        }
      </style>
      <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
    </head>
    <body>
      <div class="labels">${labelsHtml}</div>
      <script>
        ${barcodeScripts}
        setTimeout(() => window.print(), 500);
      </script>
    </body>
    </html>
  `)
  printWindow.document.close()
}

// Print staff login barcode
export function printStaffBarcode(name: string, role: string, email: string, password: string) {
  const printWindow = window.open('', '_blank', 'width=400,height=300')
  if (!printWindow) return

  const loginValue = `AL|${email}|${password}`

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Staff ID Card - ${name}</title>
      <style>
        @page {
          size: 3.5in 2in;
          margin: 0;
        }
        body { 
          font-family: 'Inter', sans-serif; 
          margin: 0;
          padding: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: #f8f9fa;
        }
        .card {
          width: 3.375in;
          height: 2.125in;
          background: white;
          padding: 15px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #D4AF37;
          padding-bottom: 8px;
        }
        .brand {
          font-weight: 900;
          font-size: 14px;
          letter-spacing: 1px;
        }
        .role {
          font-size: 8px;
          font-weight: 800;
          color: #D4AF37;
          text-transform: uppercase;
          background: #D4AF3710;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .staff-info {
          margin-top: 10px;
        }
        .name {
          font-size: 16px;
          font-weight: 800;
          color: #1a202c;
        }
        .barcode-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin-top: 5px;
        }
        #barcode {
          max-width: 100%;
        }
        .instruction {
          font-size: 7px;
          color: #a0aec0;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-top: 4px;
        }
        .sub-name {
          font-size: 8px;
          color: #718096;
          margin-top: 2px;
        }
        @media print {
          body { background: white; min-height: 0; padding: 0; }
          .card { box-shadow: none; border: 1px solid #eee; }
        }
      </style>
      <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="brand">MODEAURA</div>
          <div class="role">${role}</div>
        </div>
        
        <div class="staff-info">
          <div class="name">${name}</div>
          <div class="sub-name">${email}</div>
        </div>
        
        <div class="barcode-section">
          <svg id="barcode"></svg>
          <div class="instruction">Scan One-Tap Login</div>
        </div>
      </div>
      <script>
        JsBarcode("#barcode", "${loginValue}", {
          format: "CODE128",
          width: 1.25,
          height: 40,
          displayValue: false,
          margin: 0
        });
        setTimeout(() => window.print(), 500);
      </script>
    </body>
    </html>
  `)
  printWindow.document.close()
}
