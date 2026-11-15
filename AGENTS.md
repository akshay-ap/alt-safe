## Code Style & Architecture
- **Principles:** Apply Clean Code, SOLID, and DRY (Don't Repeat Yourself) principles. 
- **Complexity:** Keep code simple. Limit all functions to a maximum of 30 lines.
- **Comments:** Explain *why* the code does something, not *what*. Never write obvious or redundant comments.
- **Layered Architecture:** Create strict abstractions:
  - **API Layer:** Handles routing and uses services to format/assemble the final response.
  - **Service Layer:** Contains the core business logic of the application.
  - **Data Layer:** Manages database interactions using TypeORM repositories and entities.

## Application Behavior & Production Readiness
- **App Lifecycle:** Load state on startup and save state during a graceful shutdown.
- **Resilience:** Implement health-check endpoints, request timeouts, and panic/crash recovery.
- **Configuration:** Load and strictly validate all environment variables from a `.env` file.
- **Logging:** Implement structured logging (error, warn, info, debug levels).
- **HTTP Tracking:** Assign a unique Request ID to every incoming HTTP request. Log the request ID, response status code, and execution time for traceability.

## Commits & Pull Requests
- **Unit of Work:** Keep every commit strictly scoped to a single, small logical unit of work.
- **Commit Size Limit:** Do not exceed 400 lines of code changed per commit. Ideally, target 200 lines or fewer.
- **Stacked PRs:** When building a large feature, break it down and create a stack of smaller, related Pull Requests rather than submitting one massive PR.

## Development & Testing Workflow
- **Methodology:** Follow strict Test-Driven Development (TDD).
- **Top-Down Implementation:** Build outside-in. Implement the outer API layer first using mock responses, then build out the inner service and data logic.
- **Unit Testing:** Write unit tests for every individual function. Create and use mocks heavily.
- **Integration Testing:** Write integration tests as features evolve and connect.
- **Test Data:** Use a faker library to generate realistic mock data for all tests.

## References
Consult the source code in the following repositories for architectural patterns and implementation references whenever necessary:
- [safe-smart-account](https://github.com/safe-fndn/safe-smart-account)
- [safe-deployments](https://github.com/safe-global/safe-deployments)
- [safe-modules-deployments](https://github.com/safe-global/safe-modules-deployments)