import { HttpResponse, http } from 'msw';

export const handlers = [
  http.get('https://interview-api.vercel.app/api/hotels/tokyo', () => {
    return HttpResponse.json([
      {
        id: 3,
        name: 'Hotel C',
        description: 'Hotel C description',
        photo: 'https://via.placeholder.com/150',
        rating: 2,
        stars: 5,
        address: 'Hotel C address',
      },
      {
        id: 1,
        name: 'Hotel A',
        description: 'Hotel A description',
        photo: 'https://via.placeholder.com/150',
        rating: 3,
        stars: 5,
        address: 'Hotel A address',
      },
      {
        id: 2,
        name: 'Hotel B',
        description: 'Hotel B description',
        photo: 'https://via.placeholder.com/150',
        rating: 4,
        stars: 4,
        address: 'Hotel B address',
      },
    ]);
  }),
  http.get('https://interview-api.vercel.app/api/hotels/tokyo/1/USD', () => {
    return HttpResponse.json([
      {
        id: 1,
        price: 100,
      },
      {
        id: 2,
        price: 200,
      },
    ]);
  }),
];