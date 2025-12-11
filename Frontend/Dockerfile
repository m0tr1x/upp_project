# Use Node alpine image to build the React app
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Use nginx alpine image to serve the React app
FROM nginx:alpine AS runtime
WORKDIR /usr/share/nginx/html
COPY --from=build /app/build .

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
