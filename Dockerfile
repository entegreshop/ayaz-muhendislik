# Ultra-lightweight Production Node.js Image
FROM node:20-alpine

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Copy application files
COPY package.json ./
COPY server.js ./
COPY index.html ./
COPY admin.html ./
COPY css/ ./css/
COPY js/ ./js/
COPY assets/ ./assets/
RUN mkdir -p /app/data

# Expose port
EXPOSE 3000

# Health check probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:3000/api/health || exit 1

# Start production server
CMD ["node", "server.js"]
