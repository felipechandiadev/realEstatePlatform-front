import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import PropertyFilterRent from './PropertyFilterRent'

jest.mock('@/app/actions/identity', () => ({
  getIdentity: jest.fn().mockResolvedValue({ name: 'Bravo Schott Propiedades' }),
}))

describe('PropertyFilterRent', () => {
  it('renders company name from identity when available', async () => {
    render(<PropertyFilterRent />)

    await waitFor(() => expect(screen.getByText(/BRAVO SCHOTT PROPIEDADES/i)).toBeInTheDocument())
  })
})
