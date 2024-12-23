FROM golang:1.23-alpine as builder

# Set the working directory inside the builder container
WORKDIR /app

# Copy go.mod and go.sum files to the container
COPY go.mod go.sum ./

# Copy the scripts folder into the builder container
COPY ./scripts ./scripts

# Download dependencies (to cache dependencies if unchanged)
RUN go mod tidy

# Copy the rest of the application code
COPY . .

# Build the Go application binary explicitly placing it in /bin
RUN GOOS=linux GOARCH=amd64 go build -o /bin/main ./cmd/main.go

# Step 2: Create the final image with the built binary
FROM alpine:latest

RUN apk update && apk add --no-cache bash
# Install necessary dependencies (e.g., SSL certificates)
RUN apk --no-cache add ca-certificates

# Set the working directory in the final image
WORKDIR /app

# Copy the binary from the builder image
COPY --from=builder /bin/main .

# Ensure the /scripts directory is copied correctly from the builder image
COPY --from=builder /app/scripts /app/scripts

# Expose the port the app will run on (change as needed)
EXPOSE 8080

# Command to run the application
CMD ["./main"]