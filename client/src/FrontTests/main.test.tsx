import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createRoot } from 'react-dom/client'
import App from '../App'

vi.mock('react-dom/client', () => ({
    createRoot: vi.fn(() => ({
        render: vi.fn(),
    })),
}))

describe('main.tsx', () => {
    let rootElement: HTMLDivElement

    beforeEach(() => {
        rootElement = document.createElement('div')
        rootElement.id = 'root'
        document.body.appendChild(rootElement)
    })

    afterEach(() => {
        document.body.removeChild(rootElement)
        vi.clearAllMocks()
    })

    it('should render the App component', async () => {
        await import('../main.tsx')

        expect(createRoot).toHaveBeenCalledWith(rootElement)
        const mockRender = (createRoot as any).mock.results[0].value.render
        expect(mockRender).toHaveBeenCalledWith(<App />)
    })
})
