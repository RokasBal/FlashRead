import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { describe, it, expect, vi } from 'vitest'
import BulletPoints from '../../components/bulletPoint.tsx'

describe('BulletPoints', () => {
    const choices = ['Choice 1', 'Choice 2', 'Choice 3']

    it('renders all choices', () => {
        render(<BulletPoints choices={choices} />)
        choices.forEach(choice => {
            expect(screen.getByText(choice)).toBeInTheDocument()
        })
    })

    it('calls onChanged when a bullet is clicked', () => {
        const handleChange = vi.fn()
        render(<BulletPoints choices={choices} onChanged={handleChange} />)
        fireEvent.click(screen.getByText('Choice 1'))
        expect(handleChange).toHaveBeenCalledWith(0)
    })

    it('displays the correct color for the selected bullet', () => {
        render(<BulletPoints choices={choices} selectedVariant={1} />)
        const selectedBullet = screen.getByText('Choice 2')
        expect(selectedBullet).toHaveStyle('list-style-type: disc')
    })

    it('displays the correct color for the correct and incorrect bullets', () => {
        render(<BulletPoints choices={choices} correctVariant={1} selectedVariant={0} />)
        const correctBullet = screen.getByText('Choice 2')
        const incorrectBullet = screen.getByText('Choice 1')
        expect(correctBullet).toHaveStyle('color: #00A7CC')
        expect(incorrectBullet).toHaveStyle('color: #D61F34')
    })

    it('does not allow selection when correctVariant is defined', () => {
        render(<BulletPoints choices={choices} correctVariant={1} />)
        fireEvent.click(screen.getByText('Choice 1'))
        const selectedBullet = screen.getByText('Choice 1')
        expect(selectedBullet).toHaveStyle('list-style-type: circle')
    })

    it('displays green color for the correct and selected bullet', () => {
        render(<BulletPoints choices={choices} correctVariant={1} selectedVariant={1} />);
        const correctSelectedBullet = screen.getByText('Choice 2');
        expect(correctSelectedBullet).toHaveStyle('color: #46C36C');
    });

    it('displays default color for unselected bullets when no correctVariant is defined', () => {
        render(<BulletPoints choices={choices} />);
        const unselectedBullet = screen.getByText('Choice 1');
        expect(unselectedBullet).toHaveStyle('color: var(--textColor)');
    });

    it('displays default color for unselected bullets when correctVariant is defined but not selected', () => {
        render(<BulletPoints choices={choices} correctVariant={1} />);
        const unselectedBullet = screen.getByText('Choice 3');
        expect(unselectedBullet).toHaveStyle('color: var(--textColor)');
    });
})