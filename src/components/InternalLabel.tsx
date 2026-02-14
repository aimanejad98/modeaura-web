"use client";

import JsBarcode from 'jsbarcode';

export function printInternalLabel(order: any) {
    const printWindow = window.open('', '_blank', 'width=600,height=800');
    if (!printWindow) return;

    // Generate Barcode SVG in a hidden div
    const barcodeDiv = document.createElement('div');
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    barcodeDiv.appendChild(svg);
    JsBarcode(svg, order.orderId, {
        format: "CODE128",
        width: 2,
        height: 60,
        displayValue: true,
        fontSize: 14,
        fontOptions: "bold",
        margin: 10
    });
    const barcodeHtml = barcodeDiv.innerHTML;

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Internal Shipping Label - ${order.orderId}</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
                
                body {
                    margin: 0;
                    padding: 0;
                    font-family: 'Inter', sans-serif;
                    background: white;
                }

                .label-container {
                    width: 4in;
                    height: 6in;
                    padding: 0.25in;
                    box-sizing: border-box;
                    border: 2px solid black;
                    position: relative;
                    display: flex;
                    flex-direction: column;
                }

                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 2px solid black;
                    padding-bottom: 10px;
                    margin-bottom: 20px;
                }

                .logo {
                    font-weight: 900;
                    font-size: 24px;
                    letter-spacing: -1px;
                    text-transform: uppercase;
                }

                .label-type {
                    font-weight: 900;
                    font-size: 10px;
                    background: black;
                    color: white;
                    padding: 4px 8px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .section {
                    margin-bottom: 20px;
                }

                .section-title {
                    font-size: 10px;
                    font-weight: 900;
                    text-transform: uppercase;
                    color: #666;
                    margin-bottom: 4px;
                }

                .address-name {
                    font-size: 18px;
                    font-weight: 700;
                    margin-bottom: 2px;
                }

                .address-details {
                    font-size: 14px;
                    line-height: 1.4;
                }

                .order-summary {
                    border-top: 1px dashed #ccc;
                    padding-top: 15px;
                    flex-grow: 1;
                }

                .items-table {
                    width: 100%;
                    font-size: 11px;
                    border-collapse: collapse;
                }

                .items-table th {
                    text-align: left;
                    border-bottom: 1px solid black;
                    padding-bottom: 4px;
                }

                .items-table td {
                    padding: 4px 0;
                }

                .footer-barcode {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    border-top: 2px solid black;
                    padding-top: 10px;
                }

                @media print {
                    @page { size: 4in 6in; margin: 0; }
                    .label-container { border: none; }
                }
            </style>
        </head>
        <body>
            <div class="label-container">
                <div class="header">
                    <div class="logo">MODEAURA</div>
                    <div class="label-type">INTERNAL DELIVERY</div>
                </div>

                <div class="section">
                    <div class="section-title">Ship To</div>
                    <div class="address-name">${order.customer.split('|')[0].trim()}</div>
                    <div class="address-details">
                        ${order.address}<br>
                        ${order.city}, ${order.province || 'ON'} ${order.postalCode}<br>
                        CANADA
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">Order Info</div>
                    <div style="font-weight: bold; font-size: 14px;">#${order.orderId}</div>
                    <div style="font-size: 10px; color: #666;">Date: ${new Date(order.createdAt).toLocaleDateString()}</div>
                </div>

                <div class="order-summary">
                    <div class="section-title">Package Contents</div>
                    <table class="items-table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th style="text-align: right;">Qty</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${JSON.parse(JSON.stringify(order.items)).map((item: any) => `
                                <tr>
                                    <td>
                                        <div style="font-weight: bold;">${item.name}</div>
                                        <div style="font-size: 9px; color: #666;">${item.sku || 'NO SKU'}</div>
                                    </td>
                                    <td style="text-align: right; vertical-align: top;">${item.quantity || item.qty}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div style="margin-top: 25px; p: 15px; border: 3px solid black; border-radius: 12px; text-align: center;">
                        <div class="section-title" style="color: black;">Suggested Packaging</div>
                        <div style="font-size: 24px; font-weight: 900; letter-spacing: 2px;">
                            ${(() => {
            const items = JSON.parse(JSON.stringify(order.items));
            const hasBag = items.some((i: any) =>
                i.name?.toLowerCase().includes('bag') ||
                i.sku?.toLowerCase().includes('bag')
            );
            const hasScarf = items.some((i: any) =>
                i.name?.toLowerCase().includes('scarf') ||
                i.name?.toLowerCase().includes('shayla') ||
                i.name?.toLowerCase().includes('accessory')
            );

            if (hasBag) return 'LARGE BOX (BAG)';
            if (hasScarf) return 'SMALL BOUTIQUE BOX';
            return 'STANDARD SHIPPING BOX';
        })()}
                        </div>
                    </div>
                </div>

                <div class="footer-barcode">
                    ${barcodeHtml}
                </div>
            </div>
            <script>
                window.onload = () => {
                    setTimeout(() => {
                        window.print();
                        window.close();
                    }, 500);
                }
            </script>
        </body>
        </html>
    `);

    printWindow.document.close();
}
