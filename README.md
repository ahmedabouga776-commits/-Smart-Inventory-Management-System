# Microservices Inventory Management System

Simple DevOps-friendly microservices project with Node.js (Express), React, MongoDB, and an API Gateway. Built as a DevOps team inventory workspace.

## Team Members

- Mahmoud Mohamed Sami Mohamed
- Omar Mohamed Hussain
- Ahmed Abdelrazek Moussa Hantera
- Habiba Mohamed
- Ahmed Abdelatty Omran Ali
- Essam Elsayed Mahmoud Zayed
- Marwan mohy mahmoud



## Project Overview

This is a modern microservices-based inventory management system designed to demonstrate DevOps best practices, containerization, and distributed system architecture.

## Project Goals

- Build a scalable microservices architecture
- Implement containerized deployment using Docker & Docker Compose
- Demonstrate API gateway pattern for routing
- Showcase authentication and authorization flows
- Create a responsive web interface for inventory management
- Establish DevOps-friendly practices and deployment pipelines

## Key Features

- **User Authentication**: Secure registration and login functionality
- **Product Management**: Full CRUD operations for inventory items
- **API Gateway**: Centralized routing and request management
- **Responsive UI**: Modern React-based frontend
- **Database**: MongoDB for flexible data storage
- **Containerized**: Docker support for easy deployment

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Backend | Node.js + Express.js |
| Frontend | React |
| Database | MongoDB |
| Container | Docker & Docker Compose |
| API Gateway | Custom Express Gateway |

## Architecture

```
┌─────────────┐
│   Frontend  │ (React - Port 3000)
│  (React App)│
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│  API Gateway     │ (Port 8081)
└──────┬───────┬───┘
       │       │
       ▼       ▼
   ┌────────┐ ┌───────────┐
   │  Auth  │ │ Product   │
   │Service │ │ Service   │
   └────┬───┘ └─────┬─────┘
        │           │
        └─────┬─────┘
              ▼
         ┌─────────┐
         │ MongoDB │
         └─────────┘
```

## Services

- Auth Service: register, login
- Product Service: CRUD products
- API Gateway: routes requests to services
- Frontend: React app with login, register, and product dashboard

## Run with Docker Compose

```bash
docker compose up --build
```

Then open:
- Frontend: http://localhost:3000
- API Gateway: http://localhost:8081

## Run Tests (Docker)

```bash
docker compose -f docker-compose.test.yml up --build --abort-on-container-exit
```

## API Endpoints

- Auth Service (via gateway):
  - POST /auth/register
  - POST /auth/login
- Product Service (via gateway):
  - GET /products
  - POST /products
  - PUT /products/:id
  - DELETE /products/:id

## Environment Variables

Docker Compose reads values from `.env` in the project root.

- MONGO_URI (used for local, non-Docker runs)
- ADMIN_NAME
- ADMIN_EMAIL
- ADMIN_PASSWORD

## Notes

This demo stores passwords in plain text for simplicity. Do not use this approach in production.

## Default Account

When `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` are set, the auth service creates a default account on startup if it doesn't already exist.

## Prerequisites

- Docker & Docker Compose installed
- Node.js 16+ (for local development)
- MongoDB (if running without Docker)

## Installation & Setup

### Using Docker Compose (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd DEPI

# Configure environment variables
cp .env.example .env
# Edit .env with your settings

# Start all services
docker compose up --build
```

### Local Development

```bash
# Install dependencies for each service
cd auth-service && npm install
cd ../product-service && npm install
cd ../frontend && npm install

# Set environment variables
export MONGO_URI=mongodb://localhost:27017/inventory

# Start MongoDB
mongod

# Start services in separate terminals
npm start
```

## Project Structure

```
DEPI/
├── auth-service/          # Authentication & Authorization
├── product-service/       # Product Management
├── api-gateway/          # API Gateway & Routing
├── frontend/             # React Web Application
├── db/                   # Database scripts
├── .github/              # GitHub workflows
├── docker-compose.yml    # Production compose file
├── docker-compose.test.yml # Testing compose file
└── README.md            # Project documentation
```

## Contributing Guidelines

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes and commit: `git commit -m "Add your feature"`
3. Push to the branch: `git push origin feature/your-feature`
4. Open a Pull Request with detailed description

## Security Notes

⚠️ **Important**: This is a demo project for educational purposes.

- Passwords are stored in plain text - **DO NOT use in production**
- API keys and secrets should be managed through secure vaults
- Implement proper authentication (JWT, OAuth2) for production
- Use HTTPS in production environments
- Apply least privilege access control principles

## Troubleshooting

### Port already in use
```bash
# Find and kill process using port
lsof -i :3000  # Frontend
lsof -i :8081  # API Gateway

kill -9 <PID>
```

### MongoDB connection issues
- Ensure MongoDB service is running
- Check `MONGO_URI` environment variable
- Verify database credentials

### Docker build failures
```bash
# Clean build
docker compose down
docker system prune -a
docker compose up --build
```

## Notes
