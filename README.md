Here's an elaborated version of your README that provides more clarity and organization:

---

# CS3219 Project (PeerPrep) - AY2425S1

[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/bzPrOe11)

## Group: G35

Welcome to Group 35's submission for the CS3219 PeerPrep Project! This README provides the necessary instructions for deploying and developing the PeerPrep application.

---

## Deployment

The PeerPrep application consists of a **backend** and **frontend**, both of which can be deployed using Docker. Follow the respective instructions below to set up the services.

---

### Prerequisites

Before you proceed, ensure the following software is installed on your system:

- [Docker](https://www.docker.com/): For containerizing and deploying the application.

---

### Full Deployment (Backend + Frontend)

Deploy the complete application, including both the backend and frontend services.

#### Steps:

1. Clone this repository:

   ```bash
   git clone https://github.com/CS3219-AY2425S1/cs3219-ay2425s1-project-g35
   cd cs3219-ay2425s1-project-g35
   ```

2. Run the following command to deploy the entire application:

   ```bash
   docker-compose up -d
   ```

   - This will start all services defined in the `docker-compose.yaml` file.

3. Access the application through the specified frontend URL or backend endpoints.

---

### Backend-Only Deployment

If you only need to deploy the frontend (e.g., for UI testing), follow these steps:

#### Steps:

1. Run the following command:
   ```bash
   docker-compose -f docker-compose-backend.yaml up -d
   ```
   - This will deploy without the frontend.

---

### Frontend-Only

#### Prerequisites

- Node.js installed

#### Steps:

- Run `npm install` within the `Frontend` folder
- Run `npm run dev` within the `Frontend` folder

## Development

If you're contributing to the development of this project, here are some guidelines to get started.

### Prerequisites

- Docker (as above)

---

### Running Tests

To ensure code quality, you can run integration tests using a dedicated Docker Compose configuration file.

#### Steps:

1. Use the provided test compose file:
   ```bash
   docker-compose -f docker-compose-tests.yaml up -d --build
   ```
   - This will build and run the test environment as defined in `docker-compose-tests.yaml`.

## Common Troubleshooting Tips

### 1. Ensure that you remove volumes if you've made changes to mongo-seed

Due to the way questions are seeded, if the earlier seeded questions are still in the mongo database, new questions with the same details/slightly changed details will be rejected.

1. Run `docker compose down -v --remove-orphans`

### 2. Ensure you down the docker compose project if you've made changes to nginx.conf

If you've made changes to `nginx.conf`, you will need to bring down the project before rebuilding nginx.

1. Run `docker compose down`
2. Run `docker compose up -d --build`

Alternatively, you can use `--force-recreate`

1. You can also use `docker compose up -d --build --force-recreate` to ensure that Docker recreates the nginx container
