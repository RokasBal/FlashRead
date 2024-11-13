import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// expect.extend(matchers);

afterEach(() => {
    cleanup();
});

class IntersectionObserver {
    constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {}

    observe(target: Element) {
        // Mock implementation
    }

    unobserve(target: Element) {
        // Mock implementation
    }

    disconnect() {
        // Mock implementation
    }
}

Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: IntersectionObserver,
});

Object.defineProperty(global, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: IntersectionObserver,
});