import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ProfileCard from '../../components/profileCard.tsx'

describe('ProfileCard', () => {
    const imageSrc = 'https://example.com/profile.jpg'
    const name = 'John Doe'
    const handleEditClick = vi.fn()

    it('renders the profile image and name', () => {
        render(<ProfileCard imageSrc={imageSrc} name={name} onEditClick={handleEditClick} />)
        expect(screen.getByAltText('Profile')).toHaveAttribute('src', imageSrc)
        expect(screen.getByText(name)).toBeInTheDocument()
    })

    it('calls onEditClick when the image button is clicked', () => {
        render(<ProfileCard imageSrc={imageSrc} name={name} onEditClick={handleEditClick} />)
        fireEvent.click(screen.getByRole('button'))
        expect(handleEditClick).toHaveBeenCalled()
    })
})