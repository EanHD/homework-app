// jsdom does not implement matchMedia; provide a stub for Mantine color scheme
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }),
});

// jsdom lacks ResizeObserver; provide a no-op stub used by Mantine ScrollArea/Menu
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
// @ts-ignore
global.ResizeObserver = ResizeObserverMock;

// jsdom: URL.createObjectURL polyfill for tests that trigger downloads
// @ts-ignore
if (typeof URL.createObjectURL !== 'function') {
  // @ts-ignore
  URL.createObjectURL = () => 'blob:mock';
}
// @ts-ignore
if (typeof URL.revokeObjectURL !== 'function') {
  // @ts-ignore
  URL.revokeObjectURL = () => {};
}
