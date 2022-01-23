# Start from golang base image
FROM golang:alpine as builder
ENV TZ=Asia/Singapore

# Add Maintainer info
LABEL maintainer="Lok Jian Ming <lokjianming@gmail.com>"

# Install git.
# Git is required for fetching the dependencies.
RUN apk update && apk add --no-cache git
RUN apk add --update tzdata

# Set the current working directory inside the container 
WORKDIR /app

# Copy go mod and sum files 
COPY go.mod go.sum ./

# Download all dependencies.
RUN go mod download 

# Copy the source from the current directory to the working Directory inside the container 
COPY . .

# Build the Go app
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

# Start a new stage from scratch
FROM alpine:latest
ENV TZ=Asia/Singapore
RUN apk --no-cache add ca-certificates
RUN apk add --update tzdata

WORKDIR /root/

# Copy the prebuilt binary file from the previous stage and the .env file
COPY --from=builder /app/main .
COPY --from=builder /app/.env .       

# Expose port 8080
EXPOSE 8080

#Run the executable
CMD ["./main"]