const fs = require('fs');
const Papa = require('papaparse');

async function fetchProducts(domain) {
  let allProducts = [];
  let page = 1;
  let hasMore = true;
  while (hasMore) {
    try {
      const res = await fetch(`https://${domain}/products.json?limit=250&page=${page}`);
      const data = await res.json();
      if (data.products && data.products.length > 0) {
        allProducts = allProducts.concat(data.products);
        page++;
      } else {
        hasMore = false;
      }
    } catch (e) {
      console.error(`Error fetching from ${domain}:`, e);
      hasMore = false;
    }
  }
  return allProducts;
}

async function main() {
  console.log("Fetching from alt.brixarc.com...");
  const altProducts = await fetchProducts('alt.brixarc.com');
  console.log(`Fetched ${altProducts.length} products from alt.brixarc.com`);

  console.log("Fetching from brixarc.com...");
  const mainProducts = await fetchProducts('brixarc.com');
  console.log(`Fetched ${mainProducts.length} products from brixarc.com`);

  const brixarcPrices = new Map();

  for (const p of [...altProducts, ...mainProducts]) {
    const title = p.title;
    // Extract set number from title, e.g. "(42115)"
    const match = title.match(/\((\d+)\)/);
    const setNumber = match ? match[1] : null;
    
    let price = Infinity;
    for (const v of p.variants) {
      const vPrice = parseFloat(v.price);
      if (vPrice < price) price = vPrice;
    }
    
    if (price !== Infinity) {
      if (setNumber) {
        brixarcPrices.set(setNumber, price);
      }
      brixarcPrices.set(title.toLowerCase().trim(), price);
    }
  }

  const csvFilePath = 'public/data.csv';
  const csvText = fs.readFileSync(csvFilePath, 'utf8');
  
  const parsed = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
  });
  
  let updateCount = 0;
  const rows = parsed.data;
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const title = row['Product Name*'];
    if (!title) continue;
    
    const match = title.match(/\((\d+)\)/);
    const setNumber = match ? match[1] : null;
    
    let newPrice = null;
    
    if (setNumber && brixarcPrices.has(setNumber)) {
      newPrice = brixarcPrices.get(setNumber);
    } else {
      for (const [key, bPrice] of brixarcPrices.entries()) {
        if (typeof key === 'string' && (title.toLowerCase().includes(key) || key.includes(title.toLowerCase()))) {
          newPrice = bPrice;
          break;
        }
      }
    }
    
    if (newPrice !== null) {
      const reducedPrice = newPrice - 100;
      const currentPrice = parseFloat(row['Price*']);
      if (currentPrice !== reducedPrice) {
        console.log(`Updating ${title}: ${currentPrice} -> ${reducedPrice}`);
        row['Price*'] = reducedPrice;
        updateCount++;
      }
    }
  }
  
  if (updateCount > 0) {
    const updatedCsvText = Papa.unparse(rows);
    fs.writeFileSync(csvFilePath, updatedCsvText, 'utf8');
    console.log(`\nSuccessfully updated ${updateCount} prices in ${csvFilePath}`);
  } else {
    console.log(`\nNo prices needed updating.`);
  }
}

main();
