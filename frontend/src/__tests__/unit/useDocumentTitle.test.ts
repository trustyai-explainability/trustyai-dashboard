import { renderHook } from '@testing-library/react';
import { useDocumentTitle } from '~/app/utilities/useDocumentTitle';

describe('useDocumentTitle', () => {
  let originalTitle: string;

  beforeEach(() => {
    originalTitle = document.title;
  });

  afterEach(() => {
    document.title = originalTitle;
  });

  it('should set the document title', () => {
    const testTitle = 'Test Page Title';
    renderHook(() => useDocumentTitle(testTitle));

    expect(document.title).toBe(testTitle);
  });

  it('should update the document title when title changes', () => {
    const { rerender } = renderHook(({ title }) => useDocumentTitle(title), {
      initialProps: { title: 'Initial Title' },
    });

    expect(document.title).toBe('Initial Title');

    rerender({ title: 'Updated Title' });
    expect(document.title).toBe('Updated Title');
  });

  it('should restore the original title when component unmounts', () => {
    const testTitle = 'Test Title';
    const { unmount } = renderHook(() => useDocumentTitle(testTitle));

    expect(document.title).toBe(testTitle);

    unmount();
    expect(document.title).toBe(originalTitle);
  });

  it('should not change title if same title is provided', () => {
    const testTitle = 'Same Title';

    renderHook(() => useDocumentTitle(testTitle));
    expect(document.title).toBe(testTitle);

    renderHook(() => useDocumentTitle(testTitle));
    expect(document.title).toBe(testTitle);
  });
});
