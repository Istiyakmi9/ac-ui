#   BUILD STAGE 1

FROM node:20.16.0 as node
WORKDIR /app

COPY . .

RUN npm install

RUN npm run build -- --configuration production

# STAGE 2
FROM nginx:alpine
COPY --from=node /app/dist/axilcorps-ui/browser /usr/share/nginx/html
