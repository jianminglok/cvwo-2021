FROM node:14-alpine AS builder
ENV NODE_ENV production

# Add a work directory
WORKDIR /app

# Cache and Install dependencies
COPY package.json .
RUN npm install --production

# Copy app files
COPY . .

# Build the app
RUN npm run build

# Bundle static assets with nginx
FROM nginx:1.21.0-alpine as production

# Add your cvwo.conf.template
COPY ./cvwo.conf.template /etc/nginx/templates/

# Copy built assets from builder
COPY --from=builder /app/build /usr/share/nginx/html

# Expose port
EXPOSE 8081

# Start nginx
CMD [ "nginx", "-g", "daemon off;" ]