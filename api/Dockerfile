FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# CHANGE THIS LINE - use npm install instead of npm ci
RUN npm install --only=production

COPY . .

RUN mkdir -p logs

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

CMD ["npm", "start"]