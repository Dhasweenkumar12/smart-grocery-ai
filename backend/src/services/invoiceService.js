const PDFDocument = require('pdfkit');

class InvoiceService {
  /**
   * Generates a PDF invoice stream for a given order
   */
  static generateInvoicePDF(order, res) {
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.orderNumber}.pdf`);

    doc.pipe(res);

    // Header
    doc
      .fillColor('#1e3a8a')
      .fontSize(22)
      .text('SMART GROCERY AI', 50, 50, { bold: true })
      .fontSize(10)
      .fillColor('#4b5563')
      .text('Autonomous Inventory & Fresh Express Store', 50, 75)
      .text('GSTIN: 33AAAAA0000A1Z5 | Support: support@smartgrocery.ai', 50, 90)
      .moveDown();

    doc
      .strokeColor('#e5e7eb')
      .lineWidth(1)
      .moveTo(50, 110)
      .lineTo(550, 110)
      .stroke();

    // Invoice Meta
    doc
      .fontSize(16)
      .fillColor('#111827')
      .text('TAX INVOICE', 50, 125)
      .fontSize(10)
      .fillColor('#374151')
      .text(`Invoice No: ${order.orderNumber}`, 50, 150)
      .text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 50, 165)
      .text(`Payment: ${order.paymentMethod} (${order.paymentStatus})`, 50, 180);

    // Customer info
    doc
      .fontSize(12)
      .fillColor('#111827')
      .text('Billed To:', 350, 125)
      .fontSize(10)
      .fillColor('#374151')
      .text(order.customerDetails.name, 350, 150)
      .text(order.customerDetails.phone, 350, 165)
      .text(order.customerDetails.address, 350, 180, { width: 200 });

    // Table Header
    const tableTop = 220;
    doc
      .rect(50, tableTop, 500, 24)
      .fill('#f3f4f6');

    doc
      .fillColor('#1f2937')
      .fontSize(10)
      .text('#', 60, tableTop + 7)
      .text('Item Description', 90, tableTop + 7)
      .text('Qty', 330, tableTop + 7)
      .text('Unit Price', 380, tableTop + 7)
      .text('Total', 480, tableTop + 7);

    // Items
    let y = tableTop + 30;
    order.items.forEach((item, index) => {
      doc
        .fillColor('#374151')
        .fontSize(9)
        .text((index + 1).toString(), 60, y)
        .text(item.productName, 90, y, { width: 220 })
        .text(item.quantity.toString(), 330, y)
        .text(`₹${item.unitPrice.toFixed(2)}`, 380, y)
        .text(`₹${item.subtotal.toFixed(2)}`, 480, y);

      y += 22;
    });

    doc
      .strokeColor('#e5e7eb')
      .lineWidth(1)
      .moveTo(50, y + 5)
      .lineTo(550, y + 5)
      .stroke();

    // Summary block
    const summaryTop = y + 15;
    doc
      .fontSize(10)
      .fillColor('#4b5563')
      .text('Subtotal:', 380, summaryTop)
      .text(`₹${order.subtotal.toFixed(2)}`, 480, summaryTop)
      .text('Discount:', 380, summaryTop + 15)
      .text(`- ₹${order.discountAmount.toFixed(2)}`, 480, summaryTop + 15)
      .text('Taxes (GST 5%):', 380, summaryTop + 30)
      .text(`₹${order.taxAmount.toFixed(2)}`, 480, summaryTop + 30)
      .text('Delivery Charges:', 380, summaryTop + 45)
      .text(`₹${order.deliveryFee.toFixed(2)}`, 480, summaryTop + 45);

    doc
      .fontSize(12)
      .fillColor('#1e3a8a')
      .text('Final Amount Paid:', 350, summaryTop + 65, { bold: true })
      .text(`₹${order.finalTotal.toFixed(2)}`, 480, summaryTop + 65, { bold: true });

    // Barcode & Footer
    doc
      .fontSize(8)
      .fillColor('#6b7280')
      .text(`Barcode: ||||| | |||| ||| |||| | ${order.orderNumber} |||||`, 50, 700, { align: 'center' })
      .text('Thank you for choosing Smart Grocery AI! Freshness & Precision Guaranteed.', 50, 720, { align: 'center' });

    doc.end();
  }
}

module.exports = InvoiceService;
