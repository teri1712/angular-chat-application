FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
ARG API_URL=http://localhost:8080
ENV API_URL=$API_URL

ARG WEBSOCKET_HOST=ws://localhost:8080
ENV WEBSOCKET_HOST=$WEBSOCKET_HOST

RUN node set-env.js
RUN npm run build -- --configuration production

FROM nginx:alpine

RUN rm -rf /etc/nginx/conf.d/*

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist/web-app/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]