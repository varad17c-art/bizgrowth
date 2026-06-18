import React from 'react';
import {render, screen} from '@testing-library/react';
import Dashboard from '../../../src/components/Analytics/Dashboard';

test('renders Analytics Dashboard heading', () => {
  render(<Dashboard />);
  expect(screen.getByText(/Analytics Dashboard/i)).toBeInTheDocument();
});
