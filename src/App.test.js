import { render, screen } from '@testing-library/react'
import App from './App'

test('renders Proof Assistant title', () => {
    render(<App />)
    const titleElement = screen.getByText(/Proof Assistant/i)
    expect(titleElement).toBeInTheDocument()
})
