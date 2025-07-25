#!/bin/sh

# Start script for nginx with documentation integration

# Set default values if not provided
BACKEND_URL=${BACKEND_URL:-"http://localhost:7860"}
DOCS_URL=${DOCS_URL:-"https://docs.axiestudio.com"}
FRONTEND_PORT=${FRONTEND_PORT:-80}

echo "Starting Axie Studio Frontend with Documentation Integration"
echo "Backend URL: $BACKEND_URL"
echo "Documentation URL: $DOCS_URL"
echo "Frontend Port: $FRONTEND_PORT"

# Substitute environment variables in nginx config
envsubst '${BACKEND_URL} ${DOCS_URL} ${FRONTEND_PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Remove the template file
rm /etc/nginx/conf.d/default.conf.template

# Test nginx configuration
nginx -t

if [ $? -eq 0 ]; then
    echo "Nginx configuration is valid"
    # Start nginx in foreground
    nginx -g 'daemon off;'
else
    echo "Nginx configuration is invalid"
    exit 1
fi
