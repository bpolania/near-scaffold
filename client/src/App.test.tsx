import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Smart Contract Functions heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/Smart Contract Functions/i);
  expect(headingElement).toBeInTheDocument();
});