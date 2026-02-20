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

  // Tax Rates
  const gstRate = 0.05
  // const hstRate = 0.08 // Combined in Ontario usually, but keeping legacy separation if needed
  const hstRate = 0.08

  // Ensure numbers are valid
  const total = Number(order.total) || 0
  const subtotal = items.reduce((sum: number, item: any) => {
    const price = Number(item.price) || 0
    const qty = Number(item.quantity || item.qty) || 0
    return sum + (price * qty)
  }, 0)

  // Taxable amount includes shipping
  const taxableAmount = subtotal + shipping
  const gst = taxableAmount * gstRate
  const hst = taxableAmount * hstRate

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Order Receipt - ${order.orderId}</title>
      <style>
        @page { size: A4; margin: 0; }
        body { 
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          margin: 0; padding: 40px; background: white; color: #1B2936;
        }
        .header { text-align: center; padding-bottom: 40px; border-bottom: 2px solid #1B2936; }
        .logo-img { height: 50px; margin-bottom: 15px; }
        .tagline { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 3px; color: #9CA3AF; }
        .order-title { font-size: 24px; font-weight: 300; text-transform: uppercase; letter-spacing: 2px; margin: 40px 0 10px; text-align: center; }
        .meta-grid { display: grid; grid-template-cols: repeat(3, 1fr); gap: 20px; border-bottom: 1px solid #eee; padding: 20px 0; margin-top: 20px; }
        .meta-label { font-size: 9px; font-weight: 700; color: #9CA3AF; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; }
        .meta-value { font-size: 14px; font-weight: 600; color: #1B2936; }
        .address-box { background: #F8F9FB; padding: 30px; border-radius: 0; margin: 40px 0; border-left: 4px solid #D4AF37; }
        .items-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .items-table th { text-align: left; padding: 15px 0; font-size: 10px; font-weight: 900; text-transform: uppercase; color: #1B2936; border-bottom: 2px solid #1B2936; letter-spacing: 1px; }
        .items-table td { padding: 20px 0; border-bottom: 1px solid #eee; }
        .item-sku { font-family: monospace; font-size: 10px; color: #9CA3AF; margin-top: 4px; }
        .totals-section { margin-top: 40px; float: right; width: 300px; }
        .total-row { display: flex; justify-content: space-between; padding: 10px 0; font-size: 13px; font-weight: 500; }
        .grand-total { border-top: 2px solid #1B2936; margin-top: 15px; padding-top: 15px; font-size: 20px; font-weight: 900; color: #1B2936; text-transform: uppercase; letter-spacing: 1px; }
        .footer { clear: both; margin-top: 100px; text-align: center; border-top: 1px solid #eee; padding-top: 40px; }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="/logo_v3_flat.png" class="logo-img" alt="MODE AURA" />
        <div class="tagline">Luxury Accessories • Windsor, Ontario</div>
      </div>

      <div class="order-title">Receipt</div>
      
      <div class="meta-grid">
        <div style="text-align: center;">
          <div class="meta-label">Order Number</div>
          <div class="meta-value">#${order.orderId}</div>
        </div>
        <div style="text-align: center;">
          <div class="meta-label">Date</div>
          <div class="meta-value">${new Date(order.date).toLocaleDateString()}</div>
        </div>
        <div style="text-align: center;">
          <div class="meta-label">Payment</div>
          <div class="meta-value" style="color: #D4AF37;">${order.paymentMethod || 'Card Payment'}</div>
        </div>
      </div>

      <div class="address-box">
        <div class="meta-label" style="margin-bottom: 10px;">Customer</div>
        <div style="font-size: 16px; font-weight: 800; margin-bottom: 5px;">${order.customer}</div>
        <div style="color: #666; font-size: 13px;">
          ${order.address ? `
            ${order.address}<br>
            ${order.city}, ${order.province || 'ON'} ${order.postalCode}<br>
            Canada
          ` : 'In-Store Purchase'}
        </div>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th>Item</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((item: any) => `
            <tr>
              <td>
                <div style="font-weight: 700; font-size: 14px;">${item.name}</div>
                <div class="item-sku">SKU: ${item.sku || 'N/A'}</div>
                ${item.variant ? `<div style="font-size: 11px; color: #666; margin-top: 2px;">${item.variant}</div>` : ''}
              </td>
              <td style="text-align: center; font-weight: 600;">${item.quantity || item.qty}</td>
              <td style="text-align: right; font-weight: 600;">$${(Number(item.price) || 0).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="totals-section">
        <div class="total-row text-gray-500">
          <span>Subtotal</span>
          <span>$${subtotal.toFixed(2)}</span>
        </div>
        <div class="total-row text-gray-500">
          <span>Shipping</span>
          <span>$${shipping.toFixed(2)}</span>
        </div>
        <div class="total-row text-gray-500">
          <span>Tax</span>
          <span>$${(gst + hst).toFixed(2)}</span>
        </div>
        <div class="total-row grand-total">
          <span>Total</span>
          <span>$${total.toFixed(2)}</span>
        </div>
      </div>

      <div class="footer">
        <div style="font-weight: 700; margin-bottom: 10px; font-size: 14px;">Thank you for shopping at Mode Aura.</div>
        <div style="font-size: 10px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 1px;">
          modeaura.ca • West Windsor<br>
          <span style="font-size: 9px; text-transform: none; color: #ccc;">No Returns on Clearance Items</span>
        </div>
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
