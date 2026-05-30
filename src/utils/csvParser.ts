import Papa from 'papaparse';
import type { Product } from '../types';

export const parseCSV = async (url: string): Promise<Product[]> => {
  const response = await fetch(url);
  const csvText = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const products = results.data.map((row: any, index: number) => {
          // Extract pieces and status from description if present
          const description = row['Product Description'] || '';
          
          let pieces = 'N/A';
          let status = 'In Stock'; // Default

          // Try to match patterns like "1043 pcs" or "1043pcs"
          const piecesMatch = description.match(/(\d+)\s*pcs/i);
          if (piecesMatch) {
            pieces = piecesMatch[1];
          }

          // Try to match "Status: Pre-Book" or similar
          const statusMatch = description.match(/Status:\s*(Pre-Book|In Stock)/i);
          if (statusMatch) {
            status = statusMatch[1];
          }

          const rawImageLinks = row['Image links (up to 24 for each product group)'] || '';
          const imageLinks = rawImageLinks.split(',').map((l: string) => l.trim()).filter((l: string) => l.length > 0);

          const category = row['Categories*'] || 'Uncategorized';
          
          let originalPrice = parseFloat(row['Price*']) || 0;
          let finalPrice = originalPrice;
          let finalDiscountedPrice = parseFloat(row['Discounted Price']) || 0;

          if (category.toLowerCase().includes('lumibricks') || category.toLowerCase().includes('cada')) {
            finalPrice = 0;
            finalDiscountedPrice = 0;
          } else if (originalPrice > 0) {
            finalPrice = originalPrice + 300;
            finalDiscountedPrice = Math.max(0, originalPrice - 100);
          }

          const name = row['Product Name*'] || 'Unknown Product';
          const sku = row['Variant SKU Code'] || '';
          
          let setNumber = '';
          const nameMatch = name.match(/\((\d{4,6})\)/) || name.match(/\b(\d{4,6})\b/);
          if (nameMatch) {
            setNumber = nameMatch[1];
          } else {
            const skuMatch = sku.match(/\b(\d{4,6})\b/);
            if (skuMatch) setNumber = skuMatch[1];
          }

          return {
            id: sku || `prod-${index}`,
            name: name,
            category: category,
            description: description,
            price: finalPrice,
            discountedPrice: finalDiscountedPrice,
            sku: sku,
            imageLinks: imageLinks,
            pieces: pieces,
            status: status,
            setNumber: setNumber
          };
        });
        
        // Filter out empty rows that might have been parsed
        resolve(products.filter(p => p.name !== 'Unknown Product'));
      },
      error: (error: any) => {
        reject(error);
      }
    });
  });
};
