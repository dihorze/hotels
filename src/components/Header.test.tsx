import React, { act } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { store } from '../redux/store';
import Header from './Header';

test('renders Header component', async () => {
  render(
    <Provider store={store}>
      <Header />
    </Provider>
  );
  expect(await screen.findByText('Stays.com')).toBeInTheDocument();
  expect(await screen.findByText('USD')).toBeInTheDocument();
});

test('currency switching dialog can be opened', async () => {
  render(
    <Provider store={store}>
      <Header />
    </Provider>
  );
  expect(screen.queryByText('Select Your Currency')).not.toBeInTheDocument();
  await act(async () => {
    fireEvent.click(screen.getByText('USD'));
  });
  // Verify the modal is now in the document
  const modal = screen.getByRole('dialog');
  expect(modal).toBeInTheDocument();

  expect(within(modal).getByText('Select Your Currency')).toBeInTheDocument();
  // check USD is selected
  expect(within(modal).getByText('USD')).toHaveClass('text-white');
});

test('currency can be switched', async () => {
  render(
    <Provider store={store}>
      <Header />
    </Provider>
  );
  await act(async () => {
    fireEvent.click(screen.getByText('USD'));
  });
  const modal = await screen.findByRole('dialog');
  const currencyButton = within(modal).getByText('SGD');
  expect(currencyButton).not.toHaveClass('text-white');
  // Click on SGD
  await act(async () => {
    userEvent.click(currencyButton);
  });

  // Verify SGD is selected
  expect(within(modal).getByText('SGD')).toHaveClass('text-white');
});
