# FoodHub - Docker Compose

FoodHub is a full-stack food ordering application built as a practical project to learn how to design, develop, and containerize a multi-container application using Docker Compose.

The project started as a local full-stack application and was developed step by step using React, Node.js, Express.js, and PostgreSQL. After completing the application, the next step was to move the different components into Docker containers and connect them together using Docker Compose.

The main purpose of this project is to understand how a real application is structured, how its services communicate, how data is stored, and how the complete system can be managed as one containerized application.

## Project Overview

FoodHub is a food ordering application that allows users to browse products, search for food, add products to a cart, create an account, log in, and place orders.

The application includes:

- Product browsing
- Product search
- Product categories
- Shopping cart
- User registration
- User login
- JWT authentication
- Password hashing with bcrypt
- Checkout
- Order creation
- Viewing previous orders

## Architecture

The application follows a simple three-tier architecture:

```text
                         User
                           |
                           v
                 +-------------------+
                 |     Frontend      |
                 | React + Vite       |
                 |       Nginx        |
                 +---------+---------+
                           |
                           v
                 +-------------------+
                 |      Backend      |
                 | Node.js           |
                 | Express.js        |
                 +---------+---------+
                           |
                           v
                 +-------------------+
                 |     PostgreSQL    |
                 |      Database     |
                 +-------------------+
```

The frontend is responsible for the user interface, the backend provides the application API, and PostgreSQL stores the application data.

## Technology Stack

### Frontend

- React
- Vite
- JavaScript
- Nginx

### Backend

- Node.js
- Express.js
- JavaScript
- REST API

### Database

- PostgreSQL

### Authentication

- JWT
- bcrypt

### Containerization

- Docker
- Docker Compose
- Docker Images
- Docker Containers
- Docker Networks
- Docker Volumes

## Application Architecture

The application is divided into three main services.

### Frontend

The frontend is built with React and Vite.

It is responsible for the user interface and communicates with the backend API.

The production frontend uses a multi-stage Docker build. The React application is built using Node.js and the generated files are then served by Nginx.

The frontend build flow is:

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
   |
   v
Production Frontend
```

### Backend

The backend is built with Node.js and Express.js.

It provides the API used by the frontend for:

- Authentication
- Products
- Cart operations
- Orders
- Database communication

The backend runs on port `3000`.

### Database

PostgreSQL is used as the relational database for the application.

The database stores:

- Users
- Products
- Carts
- Cart items
- Orders
- Order items

## Backend API

The backend provides REST API endpoints for the main application features.

### Health Check

```text
GET /api/health
```

### Products

```text
GET /api/products
GET /api/products/:id
```

### Cart

```text
GET /api/cart
POST /api/cart
DELETE /api/cart/:productId
```

### Orders

```text
POST /api/orders
GET /api/orders
```

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
```

## Authentication

FoodHub uses JWT-based authentication.

User passwords are hashed using bcrypt before they are stored in PostgreSQL.

After a successful login, the backend generates a JWT token.

Authenticated requests use:

```text
Authorization: Bearer <token>
```

The backend validates the token using authentication middleware and identifies the authenticated user before handling protected operations.

This is also used in the order flow. The backend gets the authenticated user from the validated JWT instead of trusting a user ID sent by the frontend.

## Database Structure

The main database tables are:

```text
users
products
carts
cart_items
orders
order_items
```

The main relationships can be represented as:

```text
users
  |
  +---- carts
  |       |
  |       +---- cart_items ---- products
  |
  +---- orders
          |
          +---- order_items ---- products
```

## Database Initialization

The PostgreSQL database is initialized using SQL scripts stored in the `database` directory.

```text
database/
├── 001_schema.sql
├── 002_products.sql
└── 003_product_image_paths.sql
```

### 001_schema.sql

Creates the database tables and relationships.

### 002_products.sql

Adds the initial product data.

### 003_product_image_paths.sql

Adds the image paths used by the products.

These scripts are mounted into the PostgreSQL initialization directory:

```text
/docker-entrypoint-initdb.d
```

PostgreSQL runs these scripts automatically when the database is initialized for the first time.

## Dockerization

After developing and testing the application locally, the application was containerized using Docker.

The project uses separate containers for the main services:

```text
foodhub-frontend
foodhub-backend
foodhub-database
```

The general Docker architecture is:

```text
                         Browser
                            |
                            v
                  +-------------------+
                  | Frontend Container|
                  | React + Nginx     |
                  +---------+---------+
                            |
                            v
                  +-------------------+
                  | Backend Container |
                  | Node.js + Express |
                  +---------+---------+
                            |
                            v
                  +-------------------+
                  | Database Container|
                  | PostgreSQL        |
                  +---------+---------+
                            |
                            v
                       Docker Volume
                       postgres_data
```

## Docker Compose

Docker Compose is used to define and manage the complete application.

The Compose configuration contains three services:

```text
database
backend
frontend
```

Docker Compose allows the complete application to be started with one command:

```bash
docker compose up -d
```

The services are connected through the Docker Compose network.

## Docker Networking

One of the main concepts practiced in this project was container-to-container communication.

The backend does not connect to PostgreSQL using `localhost`.

Inside a container, `localhost` refers to the same container.

Instead, the backend connects to PostgreSQL using the Docker Compose service name:

```text
database:5432
```

The communication looks like:

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

Docker Compose provides internal networking and DNS, allowing services to communicate using their service names.

This is different from the local development environment.

Local development:

```text
DB_HOST=localhost
```

Docker:

```text
DB_HOST=database
```

The application code can remain the same while the environment configuration changes.

## Environment Variables

The backend uses environment variables for configuration.

The main configuration values include:

```text
DB_HOST
DB_PORT
DB_NAME
DB_USER
DB_PASSWORD
JWT_SECRET
```

The application reads these values from the environment.

For example:

```text
process.env.DB_HOST
process.env.DB_PORT
process.env.DB_NAME
```

This allows the same application code to run in different environments with different configuration values.

Sensitive values are kept in environment configuration and are excluded from Git using `.gitignore`.

## Docker Volumes

PostgreSQL uses a named Docker volume for persistent data:

```text
postgres_data
```

The volume separates database storage from the lifecycle of the PostgreSQL container.

The basic concept is:

```text
PostgreSQL Container
        |
        v
  postgres_data
        |
        v
Persistent Database Data
```

This allows the database container to be recreated without automatically losing the stored database data.

To remove the volume as well as the containers:

```bash
docker compose down -v
```

This command should be used carefully because it removes the PostgreSQL volume and its stored data.

## Port Mapping

The main ports used by the project are:

```text
Frontend:
localhost:8080 -> container:80

Backend:
localhost:3000 -> container:3000

PostgreSQL:
localhost:5432 -> container:5432
```

The frontend is served by Nginx on port `80` inside the container and published as port `8080` on the host.

The backend runs on port `3000`.

PostgreSQL runs on port `5432`.

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

Move into the project directory:

```bash
cd foodhub-docker-compose
```

Create the required `.env` file with the required environment variables.

Then start the application:

```bash
docker compose up -d
```

Check the running services:

```bash
docker compose ps
```

View the application logs:

```bash
docker compose logs
```

Follow the logs in real time:

```bash
docker compose logs -f
```

The frontend will be available at:

```text
http://localhost:8080
```

## Stopping the Project

To stop the application and remove the containers:

```bash
docker compose down
```

The PostgreSQL volume will remain.

To also remove the PostgreSQL volume:

```bash
docker compose down -v
```

Be careful when using `-v` because it removes the persistent database data.

## Useful Docker Commands

Some of the Docker commands practiced during the project include:

```bash
docker images
docker ps
docker ps -a
docker build
docker run
docker start
docker stop
docker rm
docker rmi
docker logs
docker exec
docker inspect
docker port
docker stats
docker system df
```

Docker Compose commands used in the project include:

```bash
docker compose up -d
docker compose down
docker compose ps
docker compose logs
docker compose build
```

## What I Learned

This project helped me connect application development with infrastructure and containerization.

During the project, I practiced:

- Building a full-stack application
- Working with React
- Working with JavaScript
- Building REST APIs with Express.js
- Connecting Node.js to PostgreSQL
- Designing relational database tables
- Implementing JWT authentication
- Hashing passwords using bcrypt
- Creating Dockerfiles
- Building Docker images
- Running Docker containers
- Using multi-stage Docker builds
- Serving a React production build with Nginx
- Creating multi-container applications
- Using Docker Compose
- Understanding Docker networking
- Understanding container-to-container communication
- Using Docker service names for internal communication
- Understanding the difference between `localhost` and container networking
- Managing persistent database storage using Docker volumes
- Using environment variables for configuration
- Understanding container port publishing
- Understanding the difference between Docker images and containers
- Understanding build-time and runtime configuration

The main lesson from this project was that Docker is not only about creating containers.

It is also about understanding how application components communicate, how services are configured, how data is persisted, and how multiple services can work together as one system.

## Demo

The project was tested as a complete running application using Docker Compose.

The demo covers:

- Docker images
- Docker containers
- Docker volumes
- Docker Compose
- FoodHub application
- Product browsing
- Search and categories
- User registration
- User login
- Authentication
- Shopping cart
- Checkout
- Order creation
- Containerized application runtime

### Demo Video

Demo video will be added here.

## Project Status

The current project stage is complete for the Docker Compose architecture.

```text
Application Development        Completed
PostgreSQL Integration         Completed
Authentication                 Completed
Order Flow                     Completed
Dockerfiles                    Completed
Docker Images                  Completed
Docker Containers              Completed
Docker Compose                 Completed
Docker Networking              Completed
Docker Volumes                 Completed
Application Testing            Completed
Demo Recording                 Completed
```

## Next Step

This project is the first stage of my FoodHub architecture journey.

The same application will be used as the base for the next stages of the project.

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
Azure Kubernetes Service (AKS)
        |
        v
Terraform
        |
        v
Cloud Architecture
```

The next stage will focus on taking the existing Docker Compose application and deploying it using Kubernetes.

The goal is to understand how the architecture changes when moving from Docker Compose to Kubernetes, and why each new technology is useful in a larger environment.

## Project Summary

FoodHub is a practical full-stack and containerization project built to understand how an application moves from a local development environment into a multi-container architecture.

The final Docker Compose architecture combines:

```text
React
+
Node.js
+
Express.js
+
PostgreSQL
+
Nginx
+
Docker
+
Docker Compose
```

The result is a working food ordering application running as a containerized system with separate frontend, backend, and database services.

This project will be used as the foundation for the next stage of the learning journey: Kubernetes and cloud deployment.
