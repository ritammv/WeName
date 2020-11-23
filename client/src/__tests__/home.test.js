import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';

import Home from '../containers/Home'

describe('Home', () => {
  afterEach(() => {
    cleanup();
  });

  test('render correctly', () => {
    const home = render(<Home />);
    expect(home.baseElement).toMatchSnapshot();
  });

  test('should render title', () => {
    render(<Home />);
    expect(screen.findByText("Find your favourite baby names")).toBeTruthy();
  });

  test('renders start button', () => {
    render(<Home/>)
    expect(screen.getByText('Start')).toBeInTheDocument();
  });

  test('renders sign up button', () => {
    render(<Home/>)
    expect(screen.getByText('Sign up')).toBeInTheDocument();
  });


  })
