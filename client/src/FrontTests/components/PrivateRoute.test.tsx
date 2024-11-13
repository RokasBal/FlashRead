import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import PrivateRoute from '../../components/PrivateRoute.tsx'
import { useAuth } from '../../context/AuthContext.tsx'

// Mock the useAuth hook
vi.mock('../../context/AuthContext.tsx', () => ({
    useAuth: vi.fn(),
}))

describe('PrivateRoute', () => {
    it('renders children when authenticated', () => {
        (useAuth as vi.Mock).mockReturnValue({ isAuthenticated: true })

        render(
            <MemoryRouter initialEntries={['/private']}>
                <Routes>
                    <Route
                        path="/private"
                        element={
                            <PrivateRoute>
                                <div>Private Content</div>
                            </PrivateRoute>
                        }
                    />
                </Routes>
            </MemoryRouter>
        )

        expect(screen.getByText('Private Content')).toBeInTheDocument()
    })

    it('redirects to login when not authenticated', () => {
        (useAuth as vi.Mock).mockReturnValue({ isAuthenticated: false })

        render(
            <MemoryRouter initialEntries={['/private']}>
                <Routes>
                    <Route
                        path="/private"
                        element={
                            <PrivateRoute>
                                <div>Private Content</div>
                            </PrivateRoute>
                        }
                    />
                    <Route path="/Users/Login" element={<div>Login Page</div>} />
                </Routes>
            </MemoryRouter>
        )

        expect(screen.getByText('Login Page')).toBeInTheDocument()
    })
})