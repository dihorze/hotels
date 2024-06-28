import React, { act } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../redux/store';
import PropertyItem from './PropertyItem';
import ReduxActions from '../redux/ReduxActions';

const property: Property = {
  id: 1,
    name: 'Hotel A',
    description: 'Hotel A description',
    photo: 'https://via.placeholder.com/150',
    rating: 9.1,
    stars: 4,
    address: 'Hotel A address',
    propertyPrice: {
      id: 1,
      price: 80,
      taxes_and_fees: {
        tax: 10,
        hotel_fees: 5,
      },
      competitors: {
        Expedia: 100,
        hotels: 90,
      }
    },
};

test('renders PropertyItem component', async () => {
  render(
    <Provider store={store}>
      <PropertyItem property={property} />
    </Provider>
  );
  expect(screen.getByText('Hotel A')).toBeInTheDocument();
  expect(screen.getByText('Hotel A address')).toBeInTheDocument();
  const stars = screen.getAllByTestId('StarIcon');
  expect(stars.length).toBe(5);

  // Check if the first 4 stars are yellow
  stars.slice(0, 4).forEach(star => {
    expect(star).toHaveClass('text-yellow-500');
  });
  stars.slice(5).forEach(star => {
    expect(star).not.toHaveClass('text-yellow-500');
  });

  // Check if the rating is displayed correctly
  expect(screen.getByText('9.1')).toBeInTheDocument();
  expect(screen.getByText('Wonderful')).toBeInTheDocument();

  // Check if the price is displayed correctly
  expect(screen.getByText('1 night, 2 adults')).toBeInTheDocument();

  const priceTag = screen.getByTestId('property-price_1');
  expect(within(priceTag).getByText('US$ 80')).toBeInTheDocument();

  expect(screen.getByText('See Availability')).toBeInTheDocument();
});

test('renders savings and strikethrough when competitors are available', async () => {
  render(
    <Provider store={store}>
      <PropertyItem property={property} />
    </Provider>
  );
  expect(screen.getByText('Save 20%')).toBeInTheDocument();

  const priceTag = screen.getByTestId('property-price_1');
  expect(within(priceTag).getByText('US$ 100')).toHaveClass('line-through');
});

test('renders long currency format', async () => {
  const propertyWithLongCurrency = {
    ...property,
    propertyPrice: {
      ...(property.propertyPrice as PropertyPrice),
      price: 8000,
      competitors: {
        Expedia: 10000,
        hotels: 9000,
      }
    }
  };

  render(
    <Provider store={store}>
      <PropertyItem property={propertyWithLongCurrency} />
    </Provider>
  );
  const priceTag = screen.getByTestId('property-price_1');
  expect(within(priceTag).getByText('US$ 8,000')).toBeInTheDocument();
  expect(within(priceTag).getByText('US$ 10,000')).toBeInTheDocument();
});

test('renders KRW currency format', async () => {
  const propertyWithKRW = {
    ...property,
    propertyPrice: {
      ...(property.propertyPrice as PropertyPrice),
      price: 8023,
      competitors: {
        Expedia: 10090,
        hotels: 9000,
      }
    }
  };
  
  await act(async () => {
    ReduxActions.save({ currency: 'KRW' });
  });

  render(
    <Provider store={store}>
      <PropertyItem property={propertyWithKRW} />
    </Provider>
  );
  const priceTag = screen.getByTestId('property-price_1');
  expect(within(priceTag).getByText('KRW 8,000')).toBeInTheDocument();
  expect(within(priceTag).getByText('KRW 10,100')).toBeInTheDocument();

  await act(async () => {
    ReduxActions.save({ currency: 'USD' });
  });
});

test('renders taxes and fees', async () => {
  render(
    <Provider store={store}>
      <PropertyItem property={property} />
    </Provider>
  );
  const priceTag = screen.getByTestId('property-price_1');
  const taxesAndFees = within(priceTag).getByText('includes taxes & fees');

  expect(taxesAndFees).toBeInTheDocument();

  expect(screen.queryByText('Taxes:')).not.toBeInTheDocument();
  expect(screen.queryByText('Hotel fees:')).not.toBeInTheDocument();

  await act(async () => {
    fireEvent.mouseEnter(taxesAndFees);
  });

  const popover = screen.getByRole('presentation')

  expect(within(popover).getByText('Taxes:')).toBeInTheDocument();
  expect(within(popover).getByText('Hotel fees:')).toBeInTheDocument();
  expect(within(popover).getByText('US$ 80')).toBeInTheDocument();
  expect(within(popover).getByText('US$ 10')).toBeInTheDocument();
  expect(within(popover).getByText('US$ 5')).toBeInTheDocument();
});

test('does not render taxes and fees when not available', async () => {
  const propertyWithoutTaxesAndFees = {
    ...property,
    propertyPrice: {
      ...(property.propertyPrice as PropertyPrice),
      taxes_and_fees: undefined,
    }
  };

  render(
    <Provider store={store}>
      <PropertyItem property={propertyWithoutTaxesAndFees} />
    </Provider>
  );
  const priceTag = screen.getByTestId('property-price_1');
  const taxesAndFees = within(priceTag).queryByText('includes taxes & fees');

  expect(taxesAndFees).not.toBeInTheDocument();
});

test('renders competitor prices', async () => {
  render(
    <Provider store={store}>
      <PropertyItem property={property} />
    </Provider>
  );

  const competitor1 = screen.getByAltText('Stays.com');
  const competitor2 = screen.getByAltText('Expedia');
  const competitor3 = screen.getByText('hotels');

  expect(competitor1).toBeInTheDocument(); // us 80
  expect(competitor2).toBeInTheDocument(); // expedia 100
  expect(competitor3).toBeInTheDocument(); // hotels 90

  // check if the order is correct
  expect(competitor1.compareDocumentPosition(competitor3)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  expect(competitor3.compareDocumentPosition(competitor2)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
});

test('renders competitor prices properly with many competitors', async () => {
  const propertyWithManyCompetitors = {
    ...property,
    propertyPrice: {
      ...(property.propertyPrice as PropertyPrice),
      competitors: {
        ...property.propertyPrice?.competitors,
        Booking: 85,
        Agoda: 87,
        Kayak: 88,
      }
    }
  };

  render(
    <Provider store={store}>
      <PropertyItem property={propertyWithManyCompetitors} />
    </Provider>
  );

  // check only the first 3 competitors are displayed
  const competitor1 = screen.getByAltText('Stays.com');
  const competitor4 = screen.getByAltText('Booking');
  let competitor5 = screen.getByAltText('Agoda');

  expect(competitor1).toBeInTheDocument(); // us 80
  expect(competitor4).toBeInTheDocument(); // booking 85
  expect(competitor5).toBeInTheDocument(); // agoda 87

  expect(screen.queryByText('Kayak')).not.toBeInTheDocument(); // kayak 88
  expect(screen.queryByText('hotels')).not.toBeInTheDocument(); // hotels 90
  expect(screen.queryByAltText('Expedia')).not.toBeInTheDocument(); // expedia 100

  // check if the order is correct
  expect(competitor1.compareDocumentPosition(competitor4)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  expect(competitor4.compareDocumentPosition(competitor5)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);

  const moreCompetitorsButton = screen.getByText('and 3 more');
  expect(moreCompetitorsButton).toBeInTheDocument();

  await act(async () => {
    fireEvent.click(moreCompetitorsButton);
  });

  const popover = screen.getByRole('presentation');
  expect(within(popover).getAllByText(/US\$/).length).toBe(4);

  // check if the order is correct in the popover
  competitor5 = within(popover).getByText('Agoda');
  const competitor6 = within(popover).getByText('Kayak');
  const competitor3 = within(popover).getByText('hotels');
  const competitor2 = within(popover).getByText('Expedia');

  expect(competitor5).toBeInTheDocument();
  expect(competitor6).toBeInTheDocument();
  expect(competitor3).toBeInTheDocument();
  expect(competitor2).toBeInTheDocument();
  
  expect(competitor5.compareDocumentPosition(competitor6)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  expect(competitor6.compareDocumentPosition(competitor3)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  expect(competitor3.compareDocumentPosition(competitor2)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
});

test('renders property without competitors', async () => {
  const propertyWithoutCompetitors = {
    ...property,
    propertyPrice: {
      ...(property.propertyPrice as PropertyPrice),
      competitors: undefined,
    }
  };

  render(
    <Provider store={store}>
      <PropertyItem property={propertyWithoutCompetitors} />
    </Provider>
  );

  expect(screen.queryByAltText('Stays.com')).not.toBeInTheDocument();
  expect(screen.queryByAltText('Expedia')).not.toBeInTheDocument();
  expect(screen.queryByText('hotels')).not.toBeInTheDocument();
});

test('renders property without price', async () => {
  const propertyWithoutPrice = {
    ...property,
    propertyPrice: undefined,
  };

  render(
    <Provider store={store}>
      <PropertyItem property={propertyWithoutPrice} />
    </Provider>
  );

  expect(screen.getByText('Rates unavailable')).toBeInTheDocument();
  expect(screen.queryByAltText('Stays.com')).not.toBeInTheDocument();
});
