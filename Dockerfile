FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build -- --configuration production

FROM nginx:alpine

RUN rm -rf /etc/nginx/conf.d/*

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist/web-app/browser /usr/share/nginx/html

EXPOSE 80

# Default environment variables
ENV API_URL=http://localhost:8080
ENV WEBSOCKET_HOST=ws://localhost:8080
ENV GOOGLE_CLIENT_ID=863552069596-2qbk9ci1jmdic6271pluqsd7snm11mof.apps.googleusercontent.com

CMD ["/bin/sh", "-c", "envsubst < /usr/share/nginx/html/config.template.json > /usr/share/nginx/html/config.json && exec nginx -g 'daemon off;'"]
