FROM node:14-alpine AS builder
ENV NODE_ENV production

# Add a work directory
WORKDIR /app

# Cache and install dependencies
COPY package.json .
RUN npm install --production

# Copy app files
COPY . .

# Build the React app
RUN npm run build

FROM nginx:1.21.0-alpine as production

# Copy cvwo.conf
COPY ./cvwo.conf /etc/nginx/conf.d/

# Copy built assets from builder
COPY --from=builder /app/build /usr/share/nginx/html

# Expose port 8081
EXPOSE 8081

# Start nginx
CMD [ "nginx", "-g", "daemon off;" ]
