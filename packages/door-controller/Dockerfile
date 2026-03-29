FROM node:18-slim

WORKDIR /app

# serialport needs build tools for native addon
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ && \
    rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --production

COPY src/ ./src/

# Default: simulate mode for container builds (override at runtime)
ENV SIMULATE=true
ENV HTTP_PORT=9090
ENV SERIAL_PORT=/dev/ttyS0
ENV SERIAL_BAUD=9600

EXPOSE 9090

# On the actual locker hardware, run with:
#   --device=/dev/ttyS0 -e SIMULATE=false
CMD ["node", "src/index.js"]
