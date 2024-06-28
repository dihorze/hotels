import axios from 'axios';

const BASE_URL = 'https://interview-api.vercel.app/api/hotels/tokyo';

export const getPropertyList = async () => {
  const response = await axios.get<Property[]>(`${BASE_URL}`);
  return response.data;
};

export const getPropertyPrices = async (currency: string) => {
  const response = await axios.get<PropertyPrice[]>(`${BASE_URL}/1/${currency}`);
  return response.data;
};
