import PDFDocument from 'pdfkit';

export const generateBillPDF = async (client, plan, subscription, bill, res) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
            layout: 'portrait',
            size: 'A4',
            margins: {
                top: 50,
                bottom: 50,
                left: 50,
                right: 50
            }
        });

        // Handle stream errors
        doc.on('error', (err) => {
            reject(err);
        });

        // Set response headers for PDF streaming
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=bill.pdf`);

        // Pipe the PDF directly to the response
        const stream = doc.pipe(res);

        // Header with text-based logo
        doc.fontSize(24)
            .fillColor('#87CEEB') // SkyBlue
            .text('CRM', 50, 50)
            .fontSize(16)
            .text('Client Relationship Management', 50, 80);

        // Client details
        doc.moveDown(2)
            .fontSize(14)
            .fillColor('black')
            .text(`Bill To: ${client.username}`, 50, doc.y);
        doc.fontSize(12)
            .text(`Email: ${client.email}`, 50, doc.y + 20);
        doc.moveDown();

        // Bill details
        doc.fontSize(16)
            .text(`Invoice No: ${bill.id}`, { align: 'right' })
            .text(`Date: ${new Date(bill.billDate).toLocaleDateString()}`, { align: 'right' });
        doc.moveDown();

        // Subscription details
        doc.fontSize(14)
            .text('Subscription Details:');
        doc.fontSize(12)
            .text(`Plan Name: ${plan.name}`)
            .text(`Duration: ${plan.duration}`)
            .text(`Start Date: ${new Date(subscription.start_date).toLocaleDateString()}`);
        if (subscription.end_date) {
            doc.text(`End Date: ${new Date(subscription.end_date).toLocaleDateString()}`);
        }
        doc.moveDown();

        // Plan features
        doc.fontSize(14)
            .text('Plan Features:');
        doc.fontSize(12)
            .text(`• Max Users: ${plan.max_users}`)
            .text(`• Max Clients: ${plan.max_clients}`)
            .text(`• Storage Limit: ${plan.storage_limit}`);
        doc.moveDown();

        // Billing summary
        doc.fontSize(14)
            .text('Billing Summary:');

        // Create table-like structure
        const tableTop = doc.y + 10;
        const tableLeft = 50;
        const colWidth = 250;
        const rowHeight = 20;
        const rows = [
            ['Description', 'Amount'],
            ['Subtotal', `$${plan.price}`],
            ['Discount', `$${bill.discount || 0}`],
            ['Tax', `$${bill.tax || 0}`],
            ['Total Amount', `$${bill.total}`]
        ];

        // Draw table
        rows.forEach((row, i) => {
            const y = tableTop + (i * rowHeight);

            // Draw row background
            if (i === 0) {
                doc.fillColor('#f0f0f0')
                    .rect(tableLeft, y, colWidth * 2, rowHeight)
                    .fill();
            }

            // Draw cell borders
            doc.strokeColor('#000000')
                .lineWidth(0.5)
                .rect(tableLeft, y, colWidth, rowHeight)
                .rect(tableLeft + colWidth, y, colWidth, rowHeight)
                .stroke();

            // Add text
            doc.fillColor('#000000')
                .fontSize(i === 0 || i === rows.length - 1 ? 12 : 10)
                .text(row[0], tableLeft + 5, y + 5)
                .text(row[1], tableLeft + colWidth + 5, y + 5);
        });

        doc.moveDown(4);

        // Footer
        doc.fontSize(10)
            .text('Thank you for your business!', {
                align: 'center',
                y: doc.page.height - 100
            });

        // Handle stream events
        stream.on('finish', () => {
            resolve();
        });

        stream.on('error', (err) => {
            reject(err);
        });

        // End the document
        doc.end();
    });
};
