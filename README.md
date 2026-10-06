# FoodHub - Docker Compose

FoodHub is a full-stack food ordering application built as a practical project to learn how to build, containerize, and run a multi-container application using Docker Compose.

The application was developed with React, Node.js, Express.js, and PostgreSQL, then containerized into separate services and connected together using Docker Compose.

## Project Overview

FoodHub allows users to:

- Browse food products
- Search and filter products
- Add products to a shopping cart
- Register and log in
- Authenticate using JWT
- Checkout and place orders
- View previous orders

The main goal of this project was to understand how a full-stack application moves from a local development environment to a containerized architecture.

## Architecture

The application consists of three main services:

```text
                         Browser
                            |
                            v
                  +-------------------+
                  | React + Nginx     |
                  |    Frontend       |
                  +---------+---------+
                            |
                            v
                  +-------------------+
                  | Node.js + Express |
                  |     Backend       |
                  +---------+---------+
                            |
                            | database:5432
                            v
                  +-------------------+
                  |    PostgreSQL     |
                  |     Database      |
                  +---------+---------+
                            |
                            v
                     Docker Volume
                     postgres_data
```

Docker Compose is responsible for running the services together and providing the network between them.

## Technologies

### Application

- React
- Vite
- Node.js
- Express.js
- PostgreSQL

### Authentication

- JWT
- bcrypt

### Containerization

- Docker
- Docker Compose
- Nginx
- Docker Networks
- Docker Volumes

## Docker Architecture

The project runs three main containers:

```text
foodhub-frontend
foodhub-backend
foodhub-database
```

### Frontend

The React application is built using Vite.

A multi-stage Docker build is used to build the application with Node.js and then serve the production files using Nginx.

```text
Node.js
   |
   v
npm ci
   |
   v
React / Vite Build
   |
   v
dist/
   |
   v
Nginx
```

### Backend

The backend is built with Node.js and Express.js.

It provides the REST API for authentication, products, cart operations, and orders.

### Database

PostgreSQL stores the application's persistent data.

The database is initialized automatically using SQL scripts stored in the `database` directory.

## Docker Networking

One of the main concepts practiced in this project was container-to-container communication.

The backend does not connect to PostgreSQL using `localhost`.

Inside Docker, `localhost` refers to the current container.

Instead, the backend connects to PostgreSQL using the Docker Compose service name:

```text
database:5432
```

The communication flow is:

```text
Frontend
   |
   v
Backend
   |
   | database:5432
   v
PostgreSQL
```

Docker Compose provides the internal network and DNS that allow the services to communicate using their service names.

## Persistent Storage

PostgreSQL uses a Docker named volume:

```text
postgres_data
```

The volume keeps database data separate from the PostgreSQL container lifecycle.

This allows the database container to be recreated without automatically losing its stored data.

To remove the volume as well:

```bash
docker compose down -v
```

This should be used carefully because it removes the stored PostgreSQL data.

## Database

The main database tables are:

```text
users
products
carts
cart_items
orders
order_items
```

Database initialization scripts:

```text
database/
├── 001_schema.sql
├── 002_products.sql
└── 003_product_image_paths.sql
```

## Authentication

FoodHub uses JWT-based authentication.

Passwords are hashed using bcrypt before being stored in PostgreSQL.

Authenticated requests use:

```text
Authorization: Bearer <token>
```

The backend validates the token and identifies the authenticated user before handling protected operations such as orders.

## Project Structure

```text
foodhub-docker-compose/
|
├── backend/
│   ├── src/
│   ├── Dockerfile
│   ├── package.json
│   └── package-lock.json
|
├── frontend/
│   ├── src/
│   ├── public/
│   ├── Dockerfile
│   ├── package.json
│   └── package-lock.json
|
├── database/
│   ├── 001_schema.sql
│   ├── 002_products.sql
│   └── 003_product_image_paths.sql
|
├── docker-compose.yml
├── .gitignore
└── README.md
```

## Running the Project

Make sure Docker Desktop is running.

Clone the repository:

```bash
git clone git@github.com:TomasTawfik/foodhub-docker-compose.git
```

Move into the project:

```bash
cd foodhub-docker-compose
```

Create the required `.env` file with the required environment variables.

Start the application:

```bash
docker compose up -d
```

Check the running services:

```bash
docker compose ps
```

View the logs:

```bash
docker compose logs
```

The application will be available at:

```text
http://localhost:8080
```

To stop the application:

```bash
docker compose down
```

## What I Practiced

This project helped me connect application development with containerization and infrastructure.

During the project, I practiced:

- Building a full-stack application
- Working with React and JavaScript
- Building REST APIs with Express.js
- Connecting Node.js to PostgreSQL
- Implementing JWT authentication
- Creating Dockerfiles
- Building Docker images
- Running Docker containers
- Using Docker Compose
- Understanding Docker networking
- Using Docker service names for internal communication
- Managing persistent storage with Docker volumes
- Using environment variables for configuration
- Using Nginx to serve a production React build
- Understanding the difference between local and containerized environments

The main lesson from this project was understanding how multiple application services communicate and work together as one system.

## Demo

The demo shows the FoodHub application running with Docker Compose, including:

- Docker images
- Docker containers
- Docker volumes
- Docker Compose
- Application runtime
- Authentication
- Products
- Cart
- Checkout
- Orders

### Demo Video

Demo video will be added here.

## Next Step

This project is the first stage of the FoodHub architecture journey.

The next step is to take the same application and move from Docker Compose to Kubernetes.

The planned progression is:

```text
FoodHub Application
        |
        v
Docker
        |
        v
Docker Compose
        |
        v
Kubernetes
        |
        v
Azure / AKS
        |
        v
Terraform
```

The goal is to continue using the same application while learning how the architecture changes at each stage and why each technology is useful.
