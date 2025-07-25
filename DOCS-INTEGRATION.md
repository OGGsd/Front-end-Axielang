# 📚 Axie Studio Documentation Integration

This document explains how the Axie Studio documentation is integrated with the frontend application.

## 🎯 Integration Overview

The documentation is accessible at:
- `/docs` - Documentation home page
- `/docs/docs/*` - All documentation sub-pages

## 🏗️ Architecture

### Development Environment
- **Frontend**: Runs on `http://localhost:3000`
- **Documentation**: Runs on `http://localhost:3001` (Docusaurus dev server)
- **Integration**: Vite proxy routes `/docs` requests to the documentation server

### Production Environment
- **Option 1**: Nginx proxy to external documentation server (`https://docs.axiestudio.com`)
- **Option 2**: Static files served directly by nginx (if documentation is built and included)

## 🚀 Getting Started

### Development Setup

1. **Start both servers together** (Recommended):
   ```bash
   npm run dev:with-docs
   ```
   This starts both the frontend and documentation servers concurrently.

2. **Start servers separately**:
   ```bash
   # Terminal 1: Start documentation server
   cd ../axie-studio-docs
   npm run start -- --port 3001

   # Terminal 2: Start frontend server
   cd axie-studio-frontend
   npm run dev
   ```

3. **Access the application**:
   - Frontend: http://localhost:3000
   - Documentation: http://localhost:3000/docs
   - Direct docs: http://localhost:3001

### Production Deployment

#### Option 1: Proxy to External Documentation
```bash
# Build with documentation proxy
docker build -f Dockerfile.with-docs -t axie-studio-frontend:latest .

# Run with environment variables
docker run -p 80:80 \
  -e BACKEND_URL=https://your-backend.com \
  -e DOCS_URL=https://docs.axiestudio.com \
  axie-studio-frontend:latest
```

#### Option 2: Serve Static Documentation
```bash
# Build documentation first
cd ../axie-studio-docs
npm run build

# Copy to frontend static files
cp -r build/* ../axie-studio-frontend/public/docs/

# Build frontend
cd ../axie-studio-frontend
npm run build
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_DOCS_URL` | Documentation server URL (dev) | `http://localhost:3001` |
| `DOCS_URL` | Documentation server URL (prod) | `https://docs.axiestudio.com` |
| `BACKEND_URL` | Backend API URL | - |

### Vite Configuration

The Vite proxy is configured in `vite.config.mts`:

```typescript
proxyTargets["/docs"] = {
  target: docsTarget,
  changeOrigin: true,
  secure: false,
  ws: true,
  rewrite: (path) => path.replace(/^\/docs/, '/docs'),
};
```

### Nginx Configuration

Production nginx configuration in `nginx-docs.conf`:

```nginx
# Documentation routes
location /docs {
    proxy_pass __DOCS_URL__;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## 🎨 User Experience

### Features
- **Seamless Navigation**: Documentation appears as part of the main application
- **Loading States**: Shows loading spinner while documentation loads
- **Error Handling**: Graceful fallback when documentation is unavailable
- **Breadcrumb Navigation**: Shows current location in documentation
- **Responsive Design**: Works on all screen sizes

### Error Handling
- If documentation server is unavailable, shows friendly error message
- "Try Again" button to retry loading
- "Open in New Tab" fallback to external documentation

## 🧪 Testing

### Manual Testing Checklist

1. **Development Environment**:
   - [ ] Start with `npm run dev:with-docs`
   - [ ] Navigate to http://localhost:3000/docs
   - [ ] Verify documentation loads correctly
   - [ ] Test navigation between documentation pages
   - [ ] Test browser back/forward buttons

2. **Error Scenarios**:
   - [ ] Stop documentation server and verify error handling
   - [ ] Test "Try Again" functionality
   - [ ] Test "Open in New Tab" fallback

3. **Production Environment**:
   - [ ] Build and deploy with documentation integration
   - [ ] Verify `/docs` routes work correctly
   - [ ] Test with different `DOCS_URL` configurations

### Automated Testing

```bash
# Run frontend tests
npm test

# Test documentation build
cd ../axie-studio-docs
npm run build
```

## 🔍 Troubleshooting

### Common Issues

1. **Documentation not loading in development**:
   - Ensure documentation server is running on port 3001
   - Check if `../axie-studio-docs` directory exists
   - Verify Vite proxy configuration

2. **404 errors in production**:
   - Check nginx configuration
   - Verify `DOCS_URL` environment variable
   - Ensure documentation server is accessible

3. **CORS issues**:
   - Add appropriate CORS headers in nginx configuration
   - Check documentation server CORS settings

### Debug Commands

```bash
# Check if documentation server is running
curl http://localhost:3001/docs/

# Test proxy in development
curl http://localhost:3000/docs

# Check nginx configuration
nginx -t
```

## 📝 Development Notes

- Documentation component uses iframe for isolation
- React Router handles `/docs/*` routes
- Vite proxy handles development routing
- Nginx handles production routing
- Error boundaries prevent documentation issues from breaking the main app

## 🚀 Future Enhancements

- [ ] Server-side rendering for better SEO
- [ ] Documentation search integration
- [ ] Offline documentation support
- [ ] Documentation versioning support
- [ ] Analytics integration for documentation usage
