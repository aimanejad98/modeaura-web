export function printOnlineReceipt(order: any) {
  const printWindow = window.open('', '_blank', 'width=800,height=1000')
  if (!printWindow) return

  const items = Array.isArray(order.items) ? order.items : (() => {
    try {
      return JSON.parse(order.items || '[]')
    } catch (e) {
      return []
    }
  })()

  // Professional calc for totals
  const shipping = order.shippingCost ?? 0.00
  const taxRate = 0.13

  // Ensure numbers are valid
  const total = Number(order.total) || 0
  const subtotal = items.reduce((sum: number, item: any) => {
    const price = Number(item.price) || 0
    const qty = Number(item.quantity || item.qty) || 0
    return sum + (price * qty)
  }, 0)

  const tax = subtotal * taxRate

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Order Receipt - ${order.orderId}</title>
      <style>
        @page { size: A4; margin: 0; }
        body { 
          font-family: 'Inter', -apple-system, sans-serif;
          margin: 0; padding: 40px; background: white; color: #1B2936;
        }
        .header { text-align: center; padding-bottom: 40px; border-bottom: 2px solid #F3F4F6; }
        .logo-img { height: 60px; margin-bottom: 15px; }
        .tagline { font-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37]; }
        .order-title { font-size: 32px; font-weight: 800; italic; margin: 40px 0 10px; }
        .meta-grid { display: grid; grid-template-cols: repeat(3, 1fr); gap: 20px; border-top: 1px solid #F3F4F6; border-bottom: 1px solid #F3F4F6; padding: 20px 0; margin-top: 20px; }
        .meta-label { font-size: 9px; font-weight: 900; color: #9CA3AF; text-transform: uppercase; tracking-widest; margin-bottom: 5px; }
        .meta-value { font-size: 14px; font-weight: 700; color: #1B2936; }
        .address-box { background: #F9FAFB; padding: 30px; border-radius: 24px; margin: 40px 0; }
        .items-table { width: 100%; border-collapse: collapse; }
        .items-table th { text-align: left; padding: 15px; font-size: 10px; font-weight: 900; text-transform: uppercase; color: #9CA3AF; border-bottom: 2px solid #1B2936; }
        .items-table td { padding: 20px 15px; border-bottom: 1px solid #F3F4F6; }
        .item-sku { font-family: monospace; font-size: 10px; color: #9CA3AF; margin-top: 4px; }
        .totals-section { margin-top: 40px; float: right; width: 300px; }
        .total-row { display: flex; justify-content: space-between; padding: 10px 0; font-size: 13px; font-weight: 600; }
        .grand-total { border-top: 2px solid #1B2936; margin-top: 15px; padding-top: 15px; font-size: 24px; font-weight: 900; color: #D4AF37; }
        .footer { clear: both; margin-top: 100px; text-align: center; border-top: 1px solid #F3F4F6; padding-top: 40px; }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="/logo_v3_flat.png" class="logo-img" alt="MODE AURA" />
        <div class="tagline">Luxury Abayas • Windsor, Ontario</div>
      </div>

      <div class="order-title italic">Order Confirmation</div>
      
      <div class="meta-grid">
        <div>
          <div class="meta-label">Order Number</div>
          <div class="meta-value">#${order.orderId}</div>
        </div>
        <div>
          <div class="meta-label">Stream Date</div>
          <div class="meta-value">${new Date(order.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
        </div>
        <div>
          <div class="meta-label">Payment Method</div>
          <div class="meta-value">${order.paymentMethod || 'Card Payment'}</div>
        </div>
      </div>

      <div class="address-box">
        <div class="meta-label" style="margin-bottom: 15px;">Shipping Destination</div>
        <div style="font-size: 18px; font-weight: 800; margin-bottom: 5px;">${order.customer}</div>
        <div style="color: #4B5563; font-weight: 500;">
          ${order.address}<br>
          ${order.city}, ${order.province || 'ON'} ${order.postalCode}<br>
          Canada
        </div>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th>Product Description</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Unit Value</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((item: any) => `
            <tr>
              <td>
                <div style="font-weight: 700;">${item.name}</div>
                <div class="item-sku">SKU: ${item.sku || 'PENDING'}</div>
                ${item.variant ? `<div style="font-size: 11px; color: #6B7280; margin-top: 2px;">Variant: ${item.variant}</div>` : ''}
              </td>
              <td style="text-align: center; font-weight: 700;">${item.quantity || item.qty}</td>
              <td style="text-align: right; font-weight: 700;">$${(Number(item.price) || 0).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="totals-section">
        <div class="total-row text-gray-400">
          <span>Subtotal</span>
          <span>$${subtotal.toFixed(2)}</span>
        </div>
        <div class="total-row text-gray-400">
          <span>Shipping</span>
          <span>$${shipping.toFixed(2)}</span>
        </div>
        <div class="total-row text-gray-400">
          <span>Sales Tax (HST 13%)</span>
          <span>$${tax.toFixed(2)}</span>
        </div>
        <div class="total-row grand-total italic">
          <span>Total CAD</span>
          <span>$${total.toFixed(2)}</span>
        </div>
      </div>

      <div class="footer">
        <div style="font-weight: 800; margin-bottom: 10px;">Thank you for choice of excellence.</div>
        <div style="font-size: 12px; color: #9CA3AF;">Support: modeaura1@gmail.com • Web: modeaura.ca</div>
      </div>
      
      <script>
        window.onload = () => {
          setTimeout(() => {
            window.print();
          }, 500);
        };
      </script>
    </body>
    </html>
    `)
  printWindow.document.close()
}
