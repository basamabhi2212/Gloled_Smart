// Ensure jsPDF is loaded before this script, typically via <script> tags in HTML head/body.

document.addEventListener('DOMContentLoaded', () => {
    // ... (Existing Tab Switching Logic, Helper for Input Validation, Feet/Meter, Watt/Lumen, Lux, LED Driver, Home Purpose Lighting Suggestion) ...

    // --- NEW: Estimation PDF Generator Logic ---
    const loadProductsButton = document.getElementById('loadProductsButton');
    const generatePdfButton = document.getElementById('generatePdfButton');
    const productsDisplay = document.getElementById('productsDisplay');
    
    // Get references for new elements
    const discountPercentageInput = document.getElementById('discountPercentage');
    const subtotalEstimatedPriceSpan = document.getElementById('subtotalEstimatedPrice');
    const discountAmountSpan = document.getElementById('discountAmount');
    const totalEstimatedPriceSpan = document.getElementById('totalEstimatedPrice'); // This existed, but its value calculation changes

    let allProductsData = [];
    let selectedProducts = [];

    const excelFileName = "Gloled products 2025.json";

    async function loadProductData() {
        productsDisplay.innerHTML = '<p>Loading product data...</p>';
        try {
            const response = await fetch(excelFileName);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            allProductsData = data;
            displayProductsForSelection(allProductsData);
            generatePdfButton.disabled = false;
            console.log("Product data loaded:", allProductsData);
        } catch (error) {
            console.error("Failed to load product data:", error);
            productsDisplay.innerHTML = `<p style="color: red;">Error loading product data: ${error.message}. Please ensure '${excelFileName}' is in the correct location and format.</p>`;
            generatePdfButton.disabled = true;
        }
    }

    function displayProductsForSelection(products) {
        if (!products.length) {
            productsDisplay.innerHTML = '<p>No products available.</p>';
            return;
        }

        let tableHtml = `
            <table class="products-table">
                <thead>
                    <tr>
                        <th>Select</th>
                        <th>SKU</th>
                        <th>Product Name</th>
                        <th>Category</th>
                        <th>Price (₹)</th>
                        <th>GST 18%</th>
                        <th>Total Price</th>
                        <th>Key Specs</th>
                    </tr>
                </thead>
                <tbody>
        `;

        products.forEach((product, index) => {
            const sku = product['Product Code / SKU'] || 'N/A';
            const name = product['Product Name'] || 'N/A';
            const category = product['Category'] || 'N/A';
            const price = parseFloat(product['Price (₹)']) || 0;
            const gst = parseFloat(product['GST 18%']) || 0;
            const totalPrice = parseFloat(product['Total Price']) || 0;
            const specs = product['Key Specifications'] || 'N/A';

            tableHtml += `
                <tr>
                    <td><input type="checkbox" data-product-index="${index}" class="product-select-checkbox"></td>
                    <td>${sku}</td>
                    <td>${name}</td>
                    <td>${category}</td>
                    <td>${price.toFixed(2)}</td>
                    <td>${gst.toFixed(2)}</td>
                    <td>${totalPrice.toFixed(2)}</td>
                    <td>${specs}</td>
                </tr>
            `;
        });

        tableHtml += `
                </tbody>
            </table>
        `;
        productsDisplay.innerHTML = tableHtml;

        productsDisplay.querySelectorAll('.product-select-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', updateSelectedProductsAndTotals);
        });
        updateSelectedProductsAndTotals(); // Initial calculation after displaying products
    }

    // Function to update the list of selected products AND recalculate totals with discount
    function updateSelectedProductsAndTotals() {
        selectedProducts = [];
        let rawSubtotal = 0; // Total before any discount
        
        productsDisplay.querySelectorAll('.product-select-checkbox:checked').forEach(checkbox => {
            const index = parseInt(checkbox.dataset.productIndex);
            if (allProductsData[index]) {
                selectedProducts.push(allProductsData[index]);
                rawSubtotal += parseFloat(allProductsData[index]['Total Price']) || 0;
            }
        });

        // Get discount percentage
        const discountPercent = getValidNumber(discountPercentageInput, 0); // Use 0 as default if invalid
        
        // Calculate discount amount
        const discountAmountValue = (rawSubtotal * (discountPercent / 100));
        const finalTotalAfterDiscount = rawSubtotal - discountAmountValue;

        // Update display spans
        subtotalEstimatedPriceSpan.textContent = `₹ ${rawSubtotal.toFixed(2)}`;
        discountAmountSpan.textContent = `₹ ${discountAmountValue.toFixed(2)}`;
        totalEstimatedPriceSpan.textContent = `₹ ${finalTotalAfterDiscount.toFixed(2)}`;
    }

    // Event listener for Load Products button
    loadProductsButton.addEventListener('click', loadProductData);

    // Event listener for discount percentage input
    discountPercentageInput.addEventListener('input', updateSelectedProductsAndTotals);


    // Event listener for Generate PDF button
    generatePdfButton.addEventListener('click', () => {
        if (selectedProducts.length === 0) {
            alert("Please select at least one product to generate the PDF.");
            return;
        }
        generateEstimationPdf(selectedProducts);
    });

    // --- PDF Generation Function (using jsPDF and jspdf-autotable) ---
    function generateEstimationPdf(productsToInclude) {
        if (typeof window.jsPDF === 'undefined') {
            alert("PDF library (jsPDF) not loaded. Please check console for errors.");
            console.error("jsPDF is not defined. Make sure the jsPDF script is loaded correctly.");
            return;
        }

        const doc = new window.jsPDF.jsPDF();
        let yOffset = 15;

        const customerName = document.getElementById('customerName').value || 'N/A';
        const customerEmail = document.getElementById('customerEmail').value || 'N/A';
        const estimateId = document.getElementById('estimateId').value || 'EST-001';
        const discountPercent = getValidNumber(discountPercentageInput, 0);

        // Header
        doc.setFontSize(20);
        doc.text("ESTIMATION QUOTATION", 105, yOffset, null, null, "center");
        yOffset += 10;
        doc.setFontSize(12);
        doc.text(`Estimate ID: ${estimateId}`, 105, yOffset, null, null, "center");
        yOffset += 15;

        // Customer Details
        doc.setFontSize(12);
        doc.text("Customer Details:", 15, yOffset);
        yOffset += 7;
        doc.text(`Name: ${customerName}`, 15, yOffset);
        yOffset += 7;
        doc.text(`Email: ${customerEmail}`, 15, yOffset);
        yOffset += 10;

        // Product Details Table
        const tableHeaders = [
            "SKU", "Product Name", "Category", "Price (₹)", "GST 18%", "Total Price", "Key Specs"
        ];
        const tableData = productsToInclude.map(product => [
            product['Product Code / SKU'] || '',
            product['Product Name'] || '',
            product['Category'] || '',
            (parseFloat(product['Price (₹)']) || 0).toFixed(2),
            (parseFloat(product['GST 18%']) || 0).toFixed(2),
            (parseFloat(product['Total Price']) || 0).toFixed(2), // Show original total price per item
            product['Key Specifications'] || ''
        ]);

        doc.setFontSize(12);
        doc.text("Product Details:", 15, yOffset);
        yOffset += 5;

        doc.autoTable({
            startY: yOffset + 5,
            head: [tableHeaders],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold', halign: 'center' },
            styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
            columnStyles: {
                0: { cellWidth: 20 },
                1: { cellWidth: 35 },
                2: { cellWidth: 20 },
                3: { cellWidth: 20, halign: 'right' },
                4: { cellWidth: 20, halign: 'right' },
                5: { cellWidth: 20, halign: 'right' },
                6: { cellWidth: 35 }
            },
            didDrawPage: function(data) {
                let str = "Page " + doc.internal.getNumberOfPages();
                doc.setFontSize(8);
                doc.text(str, 190, doc.internal.pageSize.height - 10);
            }
        });

        // Calculate Totals for PDF (applying discount)
        let totalNetPrice = 0; // Sum of Price (₹)
        let totalGst = 0;     // Sum of GST 18%
        let rawSubtotalIncludingGst = 0; // Sum of Total Price (before overall discount)

        productsToInclude.forEach(product => {
            totalNetPrice += parseFloat(product['Price (₹)']) || 0;
            totalGst += parseFloat(product['GST 18%']) || 0;
            rawSubtotalIncludingGst += parseFloat(product['Total Price']) || 0;
        });

        // Apply discount to the rawSubtotalIncludingGst
        const discountAmount = rawSubtotalIncludingGst * (discountPercent / 100);
        const finalTotalAfterDiscount = rawSubtotalIncludingGst - discountAmount;

        yOffset = doc.autoTable.previous.finalY + 10;
        doc.setFontSize(12);
        doc.text("Summary:", 15, yOffset);
        yOffset += 7;
        doc.text(`Subtotal (Excluding GST): ₹ ${totalNetPrice.toFixed(2)}`, 15, yOffset);
        yOffset += 7;
        doc.text(`Total GST: ₹ ${totalGst.toFixed(2)}`, 15, yOffset);
        yOffset += 7;
        doc.text(`Total (Before Discount): ₹ ${rawSubtotalIncludingGst.toFixed(2)}`, 15, yOffset);
        yOffset += 7;
        doc.text(`Discount Applied (${discountPercent}%): - ₹ ${discountAmount.toFixed(2)}`, 15, yOffset);
        yOffset += 7;
        doc.setFontSize(14);
        doc.text(`Final Amount (Including GST & Discount): ₹ ${finalTotalAfterDiscount.toFixed(2)}`, 15, yOffset);
        yOffset += 15;

        // Terms and Conditions
        doc.setFontSize(10);
        doc.text("Terms and Conditions:", 15, yOffset);
        yOffset += 5;
        const terms = [
            "1. Prices are valid for 30 days from the date of this estimation.",
            "2. Payment terms: 50% advance, 50% upon delivery.",
            "3. Installation charges are separate unless specified.",
            "4. Goods once sold will not be exchanged or returned.",
            "5. The provided discount is subject to final approval and may vary."
        ];
        terms.forEach(term => {
            doc.text(term, 15, yOffset);
            yOffset += 5;
        });

        doc.save(`Estimation-${estimateId}.pdf`);
    }

    // Trigger initial calculations for all tools on page load
    convertFeetToMeters();
    calculateLumens();
    calculateApproxLux();
    calculateLedDriverSpecs();
    // No automatic product load here; it will happen when the tab is clicked or button is pressed
});
