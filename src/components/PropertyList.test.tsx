import React, { act } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { setupServer } from 'msw/node';
import { store } from '../redux/store';
import PropertyList from './PropertyList';
import { handlers } from '../mocks/handlers';

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('renders PropertyList component', async () => {
  render(
    <Provider store={store}>
      <PropertyList />
    </Provider>
  );
  expect(await screen.findByText('Sort by: Our top picks')).toBeInTheDocument();
});

test('sort by dialog can be opened', async () => {
  render(
    <Provider store={store}>
      <PropertyList />
    </Provider>
  );
  expect(screen.queryByText('Sort by')).not.toBeInTheDocument();
  const button = await screen.findByText('Sort by: Our top picks');
  await act(async () => {
    fireEvent.click(button);
  });
  // Verify the popover is now in the document
  const popover = await screen.findByRole('presentation');
  expect(popover).toBeInTheDocument();
});

test('sort by can be switched', async () => {
  render(
    <Provider store={store}>
      <PropertyList />
    </Provider>
  );
  expect(screen.queryByText('Sort by')).not.toBeInTheDocument();
  const button = await screen.findByText('Sort by: Our top picks');
  await act(async () => {
    fireEvent.click(button);
  });
  const popover = await screen.findByRole('presentation');
  const sortByButton = within(popover).getByText('Price (lowest first)');
  // Click on Price (lowest first)
  await act(async () => {
    userEvent.click(sortByButton);
  });

  // Verify Price (lowest first) is selected
  expect(await screen.findByText('Sort by: Price (lowest first)')).toBeInTheDocument();
});

test('property list is rendered', async () => {
  render(
    <Provider store={store}>
      <PropertyList />
    </Provider>
  );
  expect(await screen.findByText('Hotel A')).toBeInTheDocument();
  expect(await screen.findByText('Hotel B')).toBeInTheDocument();
});

test('property list has the right count', async () => {
  render(
    <Provider store={store}>
      <PropertyList />
    </Provider>
  );
  expect(await screen.findAllByText(/reviews/)).toHaveLength(3);
});

test('property list is sorted by price', async () => {
  render(
    <Provider store={store}>
      <PropertyList />
    </Provider>
  );
  expect(await screen.findByText('Hotel A')).toBeInTheDocument();
  expect(await screen.findByText('Hotel B')).toBeInTheDocument();
  const button = await screen.findByText('Sort by: Our top picks');
  await act(async () => {
    fireEvent.click(button);
  });
  const popover = await screen.findByRole('presentation');
  const sortByButton = within(popover).getByText('Price (highest first)');
  // Click on Price (highest first)
  await act(async () => {
    userEvent.click(sortByButton);
  });
  expect(await screen.findByText('Hotel A')).toBeInTheDocument();
  expect(await screen.findByText('Hotel B')).toBeInTheDocument();
  const hotelA = await screen.findByText('Hotel A');
  const hotelB = await screen.findByText('Hotel B');
  expect(hotelA).toBeInTheDocument();
  expect(hotelB).toBeInTheDocument();
  expect(hotelA.compareDocumentPosition(hotelB)).toBe(Node.DOCUMENT_POSITION_PRECEDING);
});

test('property list is sorted by rating', async () => {
  render(
    <Provider store={store}>
      <PropertyList />
    </Provider>
  );
  expect(await screen.findByText('Hotel A')).toBeInTheDocument();
  expect(await screen.findByText('Hotel B')).toBeInTheDocument();
  const button = await screen.findByText('Sort by: Our top picks');
  await act(async () => {
    fireEvent.click(button);
  });
  const popover = await screen.findByRole('presentation');
  const sortByButton = within(popover).getByText('Property rating (high to low)');
  // Click on Rating (highest first)
  await act(async () => {
    userEvent.click(sortByButton);
  });
  expect(await screen.findByText('Hotel A')).toBeInTheDocument();
  expect(await screen.findByText('Hotel B')).toBeInTheDocument();
  const hotelA = await screen.findByText('Hotel A');
  const hotelB = await screen.findByText('Hotel B');
  expect(hotelA).toBeInTheDocument();
  expect(hotelB).toBeInTheDocument();
  expect(hotelA.compareDocumentPosition(hotelB)).toBe(Node.DOCUMENT_POSITION_PRECEDING);
});

test('property without price is at the end of the list', async () => {
  render(
    <Provider store={store}>
      <PropertyList />
    </Provider>
  );

  const hotelC = await screen.findByText('Hotel C');
  const hotelA = await screen.findByText('Hotel A');
  const hotelB = await screen.findByText('Hotel B');
  expect(hotelC).toBeInTheDocument();
  expect(hotelA).toBeInTheDocument();
  expect(hotelB).toBeInTheDocument();
  expect(hotelA.compareDocumentPosition(hotelC)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  expect(hotelB.compareDocumentPosition(hotelC)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);

  const priceC = await screen.findByText('Rates unavailable');
  const priceA = await screen.findByText('US$ 100');
  const priceB = await screen.findByText('US$ 200');
  expect(priceC).toBeInTheDocument();
  expect(priceA).toBeInTheDocument();
  expect(priceB).toBeInTheDocument();
  expect(priceA.compareDocumentPosition(priceC)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  expect(priceB.compareDocumentPosition(priceC)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
});