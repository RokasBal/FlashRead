import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import EditableField from '../../components/editableField.tsx'

describe('EditableField', () => {
    it('renders the label and initial value', () => {
        render(<EditableField label="Test Label" initialValue="Test Value" onSave={vi.fn()} />)
        expect(screen.getByText('Test Label')).toBeInTheDocument()
        expect(screen.getByText('Test Value')).toBeInTheDocument()
    })

    it('switches to input field when edit button is clicked', () => {
        render(<EditableField label="Test Label" initialValue="Test Value" onSave={vi.fn()} />)
        fireEvent.click(screen.getByText('Edit'))
        expect(screen.getByDisplayValue('Test Value')).toBeInTheDocument()
    })

    it('calls onSave with the new value when confirm button is clicked', () => {
        const handleSave = vi.fn()
        render(<EditableField label="Test Label" initialValue="Test Value" onSave={handleSave} />)
        fireEvent.click(screen.getByText('Edit'))
        fireEvent.change(screen.getByDisplayValue('Test Value'), { target: { value: 'New Value' } })
        fireEvent.click(screen.getByText('Confirm'))
        expect(handleSave).toHaveBeenCalledWith('New Value')
    })

    it('displays the new value after saving', () => {
        render(<EditableField label="Test Label" initialValue="Test Value" onSave={vi.fn()} />)
        fireEvent.click(screen.getByText('Edit'))
        fireEvent.change(screen.getByDisplayValue('Test Value'), { target: { value: 'New Value' } })
        fireEvent.click(screen.getByText('Confirm'))
        expect(screen.getByText('New Value')).toBeInTheDocument()
    })
})