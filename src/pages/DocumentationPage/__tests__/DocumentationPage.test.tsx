import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DocumentationPage from '../index';

// Mock the iframe loading behavior
const mockIframe = {
  onLoad: null as ((event: Event) => void) | null,
  onError: null as ((event: Event) => void) | null,
};

// Mock iframe element
Object.defineProperty(window, 'HTMLIFrameElement', {
  value: class MockHTMLIFrameElement {
    src = '';
    onload: ((event: Event) => void) | null = null;
    onerror: ((event: Event) => void) | null = null;
    
    constructor() {
      mockIframe.onLoad = this.onload;
      mockIframe.onError = this.onerror;
    }
  },
});

const renderDocumentationPage = (initialPath = '/docs') => {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <DocumentationPage />
    </MemoryRouter>
  );
};

describe('DocumentationPage', () => {
  beforeEach(() => {
    // Reset mocks
    mockIframe.onLoad = null;
    mockIframe.onError = null;
  });

  it('renders documentation page with correct title', () => {
    renderDocumentationPage();
    
    expect(screen.getByText('Axie Studio')).toBeInTheDocument();
    expect(screen.getByText('Documentation')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    renderDocumentationPage();
    
    expect(screen.getByText('Loading documentation...')).toBeInTheDocument();
  });

  it('constructs correct URL for root docs path', () => {
    renderDocumentationPage('/docs');
    
    const iframe = screen.getByTitle('Axie Studio Documentation') as HTMLIFrameElement;
    expect(iframe.src).toContain('/docs/');
  });

  it('constructs correct URL for sub-paths', () => {
    renderDocumentationPage('/docs/get-started');
    
    const iframe = screen.getByTitle('Axie Studio Documentation') as HTMLIFrameElement;
    expect(iframe.src).toContain('/docs/get-started');
  });

  it('shows breadcrumb for sub-paths', () => {
    renderDocumentationPage('/docs/get-started/installation');
    
    expect(screen.getByText('get-started / installation')).toBeInTheDocument();
  });

  it('shows error state when iframe fails to load', async () => {
    renderDocumentationPage();
    
    // Simulate iframe error
    const iframe = screen.getByTitle('Axie Studio Documentation');
    if (mockIframe.onError) {
      mockIframe.onError(new Event('error'));
    }

    await waitFor(() => {
      expect(screen.getByText('Documentation Unavailable')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
      expect(screen.getByText('Open in New Tab')).toBeInTheDocument();
    });
  });

  it('uses development URL in development environment', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    renderDocumentationPage();
    
    const iframe = screen.getByTitle('Axie Studio Documentation') as HTMLIFrameElement;
    expect(iframe.src).toContain('localhost:3001');
    
    process.env.NODE_ENV = originalEnv;
  });

  it('uses production URL in production environment', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    
    renderDocumentationPage();
    
    const iframe = screen.getByTitle('Axie Studio Documentation') as HTMLIFrameElement;
    expect(iframe.src).toContain('docs.axiestudio.com');
    
    process.env.NODE_ENV = originalEnv;
  });
});
