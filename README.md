# CartFlow — Production-Style E-Commerce Microservices Platform

[![CI Pipeline](https://github.com/cartflow/cartflow-microservices/actions/workflows/ci.yml/badge.svg)](https://github.com/cartflow/cartflow-microservices/actions)
[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.3-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Spring Cloud](https://img.shields.io/badge/Spring%20Cloud-2023.0.3-blue.svg)](https://spring.io/projects/spring-cloud)
[![Apache Kafka](https://img.shields.io/badge/Apache%20Kafka-3.7-black.svg)](https://kafka.apache.org/)
[![Resilience4j](https://img.shields.io/badge/Resilience4j-2.2.0-red.svg)](https://resilience4j.readme.io/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)

CartFlow is a production-style, runnable **microservices-based e-commerce platform** designed to showcase real-world Java/Spring Boot microservice patterns, fault tolerance using Resilience4j Circuit Breakers, asynchronous event streaming with Apache Kafka, API Gateway routing, and database-per-service isolation.

---

## Architecture Diagram

```
                                  +-------------------+
                                  |   React Frontend  |
                                  |   (Vite / Port 3000) |
                                  +---------+---------+
                                            |
                                            | HTTP REST
                                            v
                                  +---------+---------+
                                  |    API Gateway    |
                                  |   (Port 8080)     |
                                  +----+----+----+----+
                                       |    |    |
             +-------------------------+    |    +--------------------------+
             |                              |                               |
             v                              v                               v
  +----------+----------+        +----------+----------+         +----------+----------+
  |   Product Service   |        |    Order Service    |         |   Payment Service   |
  |     (Port 8081)     |        |     (Port 8083)     |         |     (Port 8082)     |
  +----------+----------+        +----+-----------+----+         +----------+----------+
             |                        |           |                         |
             v                        |           v                         v
       +-----+-----+                  |    +------+------+            +-----+-----+
       | product_db|                  |    | Resilience4j|            | payment_db|
       |  (MySQL)  |                  |    |CircuitBreakr|            |  (MySQL)  |
       +-----------+                  |    +------+------+            +-----------+
                                      |           | (Sync REST)
                                      |           +----------------->
                                      |
                                      | Kafka Producer
                                      v
                                +-----+-----+
                                |   Kafka   |
                                |(Port 9092)|
                                +-----+-----+
                                      |
                                      | Kafka Consumer (order-confirmed)
                                      v
                             +--------+--------+
                             |Notification Svc |
                             |   (Port 8084)   |
                             +-----------------+
```

---

## Technology Stack

* **Backend Framework**: Java 21, Spring Boot 3.3.3, Spring Data JPA, Hibernate, Maven.
* **Microservice Architecture**: Spring Cloud Gateway, Resilience4j Circuit Breaker.
* **Database**: MySQL 8.0 (Database-per-service: `product_db`, `order_db`, `payment_db`).
* **Asynchronous Messaging**: Apache Kafka 3.7 (`order-confirmed` topic, `notification-group` consumer group).
* **Frontend**: React 18, Vite 5, Axios, React Router DOM v6, Tailwind CSS.
* **DevOps & CI/CD**: Docker, Docker Compose, GitHub Actions.

---

## Microservices Breakdown

| Microservice | Port | Database | Key Responsibilities |
| :--- | :--- | :--- | :--- |
| **API Gateway** | `8080` | N/A | Central entry point, route predicates (`/api/products/**`, `/api/orders/**`, `/api/payments/**`), CORS handling. |
| **Product Service** | `8081` | `product_db` | Product catalog CRUD, category management, price & inventory tracking. |
| **Payment Service** | `8082` | `payment_db` | Simulated payment processing, payment audit logging, failure simulation toggle endpoint. |
| **Order Service** | `8083` | `order_db` | Order placement workflow, synchronous payment client with Resilience4j, Kafka producer. |
| **Notification Service**| `8084` | N/A | Asynchronous Kafka consumer listening on `order-confirmed` topic to simulate customer notifications. |
| **React Frontend** | `3000` | `localStorage` | Product catalog, cart persistence, checkout, order history, live circuit breaker trigger. |

---

## Application Execution Flow

1. **User Request**: User clicks "Place Order" on React Frontend (`http://localhost:3000/checkout`).
2. **API Routing**: React sends `POST /api/orders` to API Gateway (`http://localhost:8080`), which proxies it to Order Service (`http://order-service:8083`).
3. **Order Initialization**: Order Service validates payload and persists the order with status `PAYMENT_PENDING` in `order_db`.
4. **Synchronous Payment via Circuit Breaker**:
   * Order Service calls `POST /api/payments` on Payment Service through a **Resilience4j Circuit Breaker**.
   * **Success Path**: Payment Service records transaction in `payment_db` with status `SUCCESS`. Order Service updates order status to `CONFIRMED`.
   * **Fault Tolerance Path**: If Payment Service is down or simulating an outage, Resilience4j catches the failure and invokes `paymentFallback()`. The order status updates cleanly to `PAYMENT_SERVICE_UNAVAILABLE` without crashing.
5. **Asynchronous Event Publishing**:
   * On successful payment, Order Service publishes `OrderConfirmedEvent` payload to Kafka topic `order-confirmed`.
6. **Event Consumption**:
   * Notification Service consumes event (`notification-group` consumer group) and logs order notification.

---

## Database Design (Database-per-Service)

### `product_db` (Product Service)
```sql
CREATE TABLE products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL,
    category VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### `order_db` (Order Service)
```sql
CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);
```

### `payment_db` (Payment Service)
```sql
CREATE TABLE payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## REST API Endpoints

### Product Service (`/api/products`)
* `GET /api/products` — Retrieve all products
* `GET /api/products/{id}` — Retrieve product by ID
* `POST /api/products` — Create product
* `PUT /api/products/{id}` — Update product
* `DELETE /api/products/{id}` — Delete product

### Order Service (`/api/orders`)
* `POST /api/orders` — Create new order & initiate workflow
* `GET /api/orders` — Retrieve all orders
* `GET /api/orders/{id}` — Retrieve order by ID
* `GET /api/orders/customer/{customerId}` — Retrieve orders for customer
* `PUT /api/orders/{id}/cancel` — Cancel order

### Payment Service (`/api/payments`)
* `POST /api/payments` — Process payment
* `POST /api/payments/toggle-failure` — Toggle failure simulation for Resilience4j demonstration
* `GET /api/payments/status-simulation` — Query failure simulation status

---

## Quick Start — Running Locally with Docker Compose

### Prerequisites
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (v20.10+)
* [Docker Compose](https://docs.docker.com/compose/) (v2+)

### Step-by-Step Execution

1. **Clone the Repository**:
   ```bash
   git clone https.github.com/cartflow/cartflow-microservices.git
   cd cartflow-microservices
   ```

2. **Start All Microservices & Infrastructure**:
   ```bash
   docker compose up --build
   ```

3. **Access Applications**:
   * **React Frontend**: [http://localhost:3000](http://localhost:3000)
   * **API Gateway**: [http://localhost:8080](http://localhost:8080)
   * **Swagger OpenAPI Docs**:
     * Product Service: [http://localhost:8081/swagger-ui.html](http://localhost:8081/swagger-ui.html)
     * Payment Service: [http://localhost:8082/swagger-ui.html](http://localhost:8082/swagger-ui.html)
     * Order Service: [http://localhost:8083/swagger-ui.html](http://localhost:8083/swagger-ui.html)

---

## Important Interview Demonstrations

### Demo 1 — Normal Order Creation Workflow
1. Open React Frontend at `http://localhost:3000`.
2. Click **"Add Sample Product"** or select a product and add it to cart.
3. Proceed to `/cart` and click **"Proceed to Checkout"**.
4. Click **"Place Order"**.
5. Observe order status: **`CONFIRMED`**.
6. Check Notification Service logs (`docker compose logs -f notification-service`):
   ```text
   INFO  Received OrderConfirmedEvent from Kafka: orderId=1, customerId=10
   INFO  Order confirmation notification sent for Order #1
   ```

---

### Demo 2 — Resilience4j Circuit Breaker Demonstration
1. Click the **"Simulate Payment Outage"** button in the React header (or call `POST http://localhost:8080/api/payments/toggle-failure`).
2. Place a new order from checkout.
3. Observe order status: **`PAYMENT_SERVICE_UNAVAILABLE`**. The system does not crash or throw unhandled 500 exceptions.
4. Open Order Service logs (`docker compose logs -f order-service`):
   ```text
   WARN  Circuit breaker fallback executed for orderId: 2. Reason: Simulated Payment Service outage for testing Resilience4j Circuit Breaker
   ```
5. Click **"Payment Service DOWN (Simulated)"** again to restore normal operations.
6. Place an order to see status return to **`CONFIRMED`**.

---

### Demo 3 — Apache Kafka Event Streaming Inspection
1. Open terminal and run Kafka container topic inspection:
   ```bash
   docker exec -it kafka kafka-console-consumer --bootstrap-server localhost:9092 --topic order-confirmed --from-beginning
   ```
2. Place a new order in the frontend.
3. Observe real-time JSON message payload streamed to terminal:
   ```json
   {"orderId":3,"customerId":10,"totalAmount":129.99}
   ```

---

## Running Unit Tests Locally

To run unit tests across all backend microservices:

```bash
# Product Service
cd product-service && mvn clean test -Dspring.profiles.active=test

# Order Service
cd ../order-service && mvn clean test -Dspring.profiles.active=test

# Payment Service
cd ../payment-service && mvn clean test -Dspring.profiles.active=test

# Notification Service
cd ../notification-service && mvn clean test -Dspring.profiles.active=test

# API Gateway
cd ../api-gateway && mvn clean test -Dspring.profiles.active=test
```

---

## Frontend Deployment on Vercel

1. Push code to GitHub.
2. Sign in to [Vercel](https://vercel.com/) and click **"Add New Project"**.
3. Select `cartflow-microservices` repository.
4. Set **Root Directory** to `frontend`.
5. Set **Build Command** to `npm run build` and **Output Directory** to `dist`.
6. Add Environment Variable:
   * `VITE_API_GATEWAY_URL` = `https://<YOUR_DEPLOYED_BACKEND_GATEWAY_URL>`
7. Click **Deploy**.

---

## Key Architecture & Design Rationale

* **Why database-per-service?** Eliminates tight database coupling, allowing independent schema migrations and horizontal scaling per microservice.
* **Why REST for Payment but Kafka for Notification?** Payment requires immediate synchronous confirmation before order confirmation, whereas notifications are non-blocking side-effects ideally decoupled via event streaming.
* **Why Resilience4j?** Prevents cascading failures when downstream payment dependencies slow down or fail.

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
