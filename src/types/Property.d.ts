interface Property {
    id: number;
    name: string;
    address: string;
    rating: number;
    stars: number;
    photo: string;
    description: string;
    propertyPrice?: PropertyPrice;
}