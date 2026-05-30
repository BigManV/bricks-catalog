export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  discountedPrice: number;
  sku: string;
  imageLinks: string[];
  pieces: string;
  status: string;
  setNumber?: string;
}
