import { orderTrackingUrl } from './deepLink';
const money = (value) => `Rs. ${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
/** A print-friendly order invoice. All amounts come from the stored order. */
export async function createInvoicePdf(order, settings, logoSrc, qrDataUrl) {
    const doc = new (await import('jspdf')).jsPDF({ unit: 'mm', format: 'a4' });
    const left = 15, right = 195, bottom = 278;
    let y = 15;
    const ink = [28, 36, 45];
    const muted = [93, 102, 111];
    const border = [213, 218, 222];
    const text = (value, x, at, size = 9, bold = false, align = 'left') => {
        doc.setFont('helvetica', bold ? 'bold' : 'normal');
        doc.setFontSize(size);
        doc.setTextColor(...ink);
        doc.text(value, x, at, { align });
    };
    const wrap = (value, width, size = 9, bold = false) => {
        doc.setFont('helvetica', bold ? 'bold' : 'normal');
        doc.setFontSize(size);
        return doc.splitTextToSize(value || '-', width);
    };
    const line = (at) => {
        doc.setDrawColor(...border);
        doc.setLineWidth(0.25);
        doc.line(left, at, right, at);
    };
    const ensure = (height) => {
        if (y + height > bottom) {
            doc.addPage();
            y = 15;
        }
    };
    let logo = null;
    if (logoSrc && typeof Image !== 'undefined') {
        try {
            logo = await new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = logoSrc;
            });
        }
        catch { /* A text-only letterhead is still usable. */ }
    }
    const companyX = logo ? 36 : left;
    if (logo) {
        const scale = Math.min(17 / logo.width, 17 / logo.height);
        doc.addImage(logo, 'PNG', left, 15, logo.width * scale, logo.height * scale);
    }
    const companyLines = [
        ...wrap(settings.businessName, 100, 13, true),
        ...wrap(settings.address, 100, 8),
        ...wrap(`Phone: ${settings.phone || '-'}`, 100, 8),
        ...(settings.gstNumber ? wrap(`GSTIN: ${settings.gstNumber}`, 100, 8) : []),
    ];
    let headerY = 19;
    const nameLineCount = wrap(settings.businessName, 100, 13, true).length;
    companyLines.forEach((value, i) => { text(value, companyX, headerY, i < nameLineCount ? 13 : 8, i < nameLineCount); headerY += i < nameLineCount ? 6 : 4; });
    text('INVOICE', right, 20, 19, true, 'right');
    text('Order copy', right, 26, 8, false, 'right');
    y = Math.max(headerY + 4, 39);
    line(y);
    y += 8;
    // Billing information and order details grow with their content.
    const address = [order.customer.address, order.customer.landmark, order.customer.village, order.customer.mandal, order.customer.pincode].filter(Boolean).join(', ');
    const billLines = [
        ...wrap(order.customer.name, 85, 10, true),
        ...wrap(address, 85),
        ...wrap(`Phone: ${order.customer.mobile}`, 85),
        ...(order.customer.email ? wrap(order.customer.email, 85) : []),
    ];
    const date = new Date(order.date);
    const dateLabel = Number.isNaN(date.getTime()) ? order.date : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const detailLines = [
        ...wrap(`Order no: ${order.orderId}`, 85),
        ...wrap(`Date: ${dateLabel}`, 85),
        ...wrap(`Payment: ${order.paymentMode}`, 85),
        ...wrap(`Delivery: ${order.deliveryMethod === 'pickup' ? 'Self pickup' : (order.deliveryLocation || 'Delivery')}`, 85),
    ];
    text('BILL TO', left, y, 8, true);
    text('ORDER DETAILS', 110, y, 8, true);
    y += 6;
    billLines.forEach((value, i) => text(value, left, y + i * 4.5, i === 0 ? 10 : 9, i === 0));
    detailLines.forEach((value, i) => text(value, 110, y + i * 4.5));
    y += Math.max(billLines.length, detailLines.length) * 4.5 + 8;
    const tableHeader = () => {
        doc.setFillColor(239, 241, 243);
        doc.rect(left, y, right - left, 9, 'F');
        text('#', 17, y + 6, 8, true);
        text('DESCRIPTION', 25, y + 6, 8, true);
        text('QTY', 132, y + 6, 8, true, 'right');
        text('RATE', 162, y + 6, 8, true, 'right');
        text('AMOUNT', 193, y + 6, 8, true, 'right');
        y += 9;
    };
    ensure(18);
    tableHeader();
    const items = order.items.map(item => {
        const price = item.product.sizes?.find(size => size.size === item.selectedSize)?.price ?? item.product.price;
        return { ...item, price, total: price * item.quantity };
    });
    for (const [index, item] of items.entries()) {
        const description = [item.product.name, [item.product.brand, item.selectedSize, item.product.unit ? `Unit: ${item.product.unit}` : ''].filter(Boolean).join(' / ')].filter(Boolean);
        const lines = description.flatMap((part, i) => wrap(part, 82, i === 0 ? 9 : 8, i === 0));
        // Extremely long descriptions continue on subsequent pages instead of being clipped.
        let offset = 0;
        while (offset < lines.length) {
            if (y + 10 > bottom) {
                doc.addPage();
                y = 15;
                tableHeader();
            }
            const count = Math.min(lines.length - offset, Math.max(1, Math.floor((bottom - y - 4) / 4.5)));
            const rowHeight = Math.max(10, count * 4.5 + 4);
            if (offset === 0) {
                text(String(index + 1), 17, y + 6, 9);
                text(String(item.quantity), 132, y + 6, 9, false, 'right');
                text(money(item.price), 162, y + 6, 8, false, 'right');
                text(money(item.total), 193, y + 6, 8, false, 'right');
            }
            lines.slice(offset, offset + count).forEach((value, i) => text(value, 25, y + 6 + i * 4.5, offset + i === 0 ? 9 : 8, offset + i === 0));
            y += rowHeight;
            line(y);
            offset += count;
            if (offset < lines.length) {
                doc.addPage();
                y = 15;
                tableHeader();
            }
        }
    }
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const adjustment = Math.round((order.total - subtotal - order.deliveryCharge - order.handlingCharge) * 100) / 100;
    const totals = [['Items subtotal', subtotal], ['Delivery', order.deliveryCharge], ['Handling', order.handlingCharge]];
    if (adjustment !== 0)
        totals.push(['Order adjustment', adjustment]);
    ensure(totals.length * 6 + 19);
    y += 6;
    totals.forEach(([label, value]) => { text(label, 125, y, 9); text(money(value), 193, y, 9, false, 'right'); y += 6; });
    line(y - 2);
    text('TOTAL', 125, y + 4, 11, true);
    text(money(order.total), 193, y + 4, 11, true, 'right');
    y += 12;
    if (order.finalDeliveryCharge !== undefined && order.finalDeliveryCharge !== order.deliveryCharge) {
        const note = wrap(`Store-confirmed delivery charge: ${money(order.finalDeliveryCharge)}. The total above is the original order total.`, 180, 8);
        ensure(note.length * 4 + 5);
        note.forEach(value => { text(value, left, y, 8); y += 4; });
    }
    const notes = ['Prices include GST unless stated otherwise.', 'Payment method shown is not a confirmation of payment.', 'Thank you for your business.'];
    ensure(42);
    y += 5;
    line(y);
    y += 7;
    text('NOTES', left, y, 8, true);
    y += 5;
    notes.forEach(note => { text(note, left, y, 8); y += 4.5; });
    if (qrDataUrl) {
        ensure(30);
        y += 3;
        doc.addImage(qrDataUrl, 'PNG', left, y, 22, 22);
        text('Scan to track your order', left + 26, y + 10, 8, true);
        y += 25;
    }
    // Keep the tracking link clickable without printing a potentially lengthy URL.
    ensure(8);
    doc.setFontSize(8);
    doc.setTextColor(...muted);
    doc.textWithLink('Track your order online', left, y + 4, { url: orderTrackingUrl(order.orderId) });
    const pages = doc.getNumberOfPages();
    for (let page = 1; page <= pages; page++) {
        doc.setPage(page);
        line(284);
        doc.setTextColor(...muted);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(`Order ${order.orderId}`, left, 290);
        doc.text(`Page ${page} of ${pages}`, right, 290, { align: 'right' });
    }
    return doc;
}
