FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# CHANGE THIS LINE
RUN npm install

COPY . .

EXPOSE 3002

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3002 || exit 1

CMD ["npm", "start"]