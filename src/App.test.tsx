import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';
import { Provider } from 'react-redux';
import { store } from './redux/store';

jest.mock('axios');

test('renders App component', async () => {
  render(
    <Provider store={store}>
      <App />
    </Provider>
  );
  expect(await screen.findByText('Stays.com')).toBeInTheDocument();
  expect(await screen.findByText('USD')).toBeInTheDocument();
});

