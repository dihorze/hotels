interface PropertyPrice {
  id: number;
  price: number;
  competitors?: { [name: string]: number; };
  taxes_and_fees?: { tax: number; hotel_fees: number; };
}
