# Web Application Testing Strategy: Unit, Integration, and E2E

Shipping software without a testing strategy is like driving without headlights. You might be fine for a while, but the moment conditions change --- a new feature, a dependency update, a traffic spike --- you hit something you did not see coming. The resulting incident costs more to fix than the tests would have cost to write, and it usually happens at the worst possible time.

But testing is not binary. "We have tests" is not a strategy. A strategy defines what to test at each layer, how much coverage to target, how tests fit into your deployment pipeline, and when to invest in more testing versus when to ship. Teams that test everything at the wrong layer waste time and money. Teams that test the right things at the right layer move fast with confidence.

## The Testing Pyramid and Why the Ratios Matter

The testing pyramid is the foundational mental model: many unit tests at the base, fewer integration tests in the middle, and a small number of end-to-end tests at the top. This structure is not arbitrary. It reflects the economics of testing.

Unit tests are cheap to write (5-15 minutes each), fast to run (milliseconds), and easy to debug (they test one thing in isolation). Integration tests are moderately expensive (30-60 minutes each), slower to run (seconds to minutes), and harder to debug (failures can originate in any connected component). E2E tests are expensive to write (1-3 hours each), slow to run (seconds to minutes per test), and frustrating to debug (failures can originate anywhere in the entire stack).

A practical ratio for a typical web application is **70% unit, 20% integration, 10% E2E**. For a test suite of 500 tests, that means roughly 350 unit tests, 100 integration tests, and 50 E2E tests. This ratio keeps your total suite execution time under 10 minutes (critical for developer workflow) while catching the vast majority of regressions.

Teams that invert the pyramid --- writing mostly E2E tests and few unit tests --- suffer from slow feedback loops (a 45-minute test suite means developers stop running tests locally), flaky tests (E2E tests are sensitive to timing, network issues, and test data state), and difficult debugging (when an E2E test fails, the root cause could be anywhere).


> Related: [The AI Technology Stack: Models, Frameworks, and Infrastructure Guide](/blog/the-ai-technology-stack-models-frameworks-and-infrastructure-guide/)


## Unit Testing: What to Test and What to Skip

Unit tests verify that individual functions, methods, or components produce the correct output for a given input, in isolation from all other parts of the system. They are the fastest feedback loop you have, and they should cover the logic that matters most.

**Test business logic thoroughly.** If you have a function that calculates shipping costs based on weight, destination, and shipping method, write 15-20 unit tests covering normal cases, edge cases (zero weight, maximum weight, international vs. domestic), and error cases (invalid inputs). This function is pure logic with high business impact --- exactly where unit tests shine.

**Test input validation and transformation.** Functions that parse user input, transform data between formats, or apply business rules are excellent unit test candidates. Test the happy path, boundary conditions, and malformed input.

**Test utility functions.** Date formatters, string manipulation helpers, mathematical calculations, and data structure operations are trivial to unit test and frequently contain subtle bugs that surface in production.

**Skip testing framework behavior.** Do not write unit tests that verify React renders a component, Express routes a request, or Prisma queries a database. You are testing the framework, not your code. Trust that frameworks work (they have their own test suites) and focus on testing your logic within them.

**Skip testing trivial getters and setters.** A function that returns a property value or sets a property value without any logic is not worth testing. The test would be longer than the code.

For the tooling layer, Jest is the standard for JavaScript/TypeScript applications. Use `describe` blocks to group tests by function, and `it` blocks for individual test cases. Name tests descriptively: `it('returns free shipping for orders over $100')` is better than `it('test case 3')`. Run unit tests on every file save during development using `--watch` mode. The feedback loop should be under 2 seconds.

## Integration Testing: Verifying Components Work Together

Integration tests verify that your components, modules, and services work correctly when connected. They catch problems that unit tests miss: incorrect API contracts, database query errors, authentication flow bugs, and mismatched data formats between layers.

**Test API endpoints end-to-end within the backend.** For a REST API, write tests that send HTTP requests to each endpoint and verify the response status, body, and headers. Use a test database (not mocks) to verify that data is correctly persisted and retrieved. Supertest (for Express/Koa) and the built-in test client in frameworks like Fastify make this straightforward.

A typical integration test for a POST /api/users endpoint would: create a request with valid user data, send it to the endpoint, verify a 201 response, verify the response body contains the created user, and query the database to confirm the record exists. Then test it again with invalid data and verify a 400 response with appropriate error messages.

**Test database interactions.** If you use an ORM like Prisma or TypeORM, your unit tests should mock the ORM. Your integration tests should use a real database. This catches issues like incorrect migrations, constraint violations, and query performance problems that mocks cannot reveal. Use a dedicated test database that is reset before each test run. Docker Compose makes spinning up a test PostgreSQL instance trivial.

**Test third-party service integrations.** For external APIs (payment processors, email services, analytics), use a two-tier approach. Write integration tests against the provider's sandbox or test environment for critical paths (payment processing, authentication). For non-critical paths (analytics events, notification delivery), use recorded HTTP fixtures (tools like Nock or Polly.js) that replay real API responses without making network calls.

**Test authentication and authorization flows.** Verify that unauthenticated requests are rejected, that users can only access resources they own, and that role-based permissions work correctly. These tests catch security regressions that unit tests cannot detect because they involve multiple components working together.


> See also: [The Real Cost of Skipping Automated Testing](/blog/the-real-cost-of-skipping-automated-testing/)


## End-to-End Testing: Simulating Real User Behavior

E2E tests operate a real browser against your full application stack. They are the closest thing to a human clicking through your app, and they catch issues that no other test type can: JavaScript errors in the browser, CSS that hides a critical button, race conditions between frontend and backend, and broken deployment configurations.

**Focus E2E tests on critical user journeys.** Identify the 5-10 workflows that, if broken, would directly impact revenue or core functionality. For a SaaS application, these might be: user registration, login, core feature usage, billing/upgrade, and password reset. For an e-commerce site: product search, add to cart, checkout, and order confirmation. Write thorough E2E tests for these flows and resist the temptation to E2E-test everything.

**Playwright is the current best choice for E2E testing.** It supports Chromium, Firefox, and WebKit with a single API, handles auto-waiting for elements (reducing flakiness), provides tracing and video recording for debugging failures, and runs faster than Selenium or Cypress in most benchmarks. A basic Playwright test for a login flow:

```javascript
test('user can log in and see dashboard', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'securepassword');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('h1')).toContainText('Welcome');
});
```

**Manage test data deliberately.** E2E tests need a known starting state. Use database seeds that create the exact data each test expects. Reset the database between test suites (not between individual tests --- that is too slow). Alternatively, design tests to create their own data as part of the test setup and clean up afterward.

**Handle flakiness aggressively.** A flaky test --- one that sometimes passes and sometimes fails without code changes --- is worse than no test. It erodes trust in the entire test suite. When a test is flaky, quarantine it immediately (move it to a separate, non-blocking suite), diagnose the root cause (usually a timing issue or shared state), and fix it before returning it to the main suite. Never accept "oh, that test is just flaky" as a permanent state.

## Fitting Tests Into Your CI/CD Pipeline

Tests that do not run automatically might as well not exist. Your CI/CD pipeline should enforce testing at every stage.

**On pull request creation:** Run the full unit test suite and integration test suite. This should complete in under 10 minutes. Block the PR from merging if any test fails. This is your quality gate, and it must be non-negotiable. Display test results and coverage reports directly in the PR for reviewer visibility.

**On merge to main:** Run the full unit, integration, and E2E test suite. E2E tests are slower and more expensive, so running them only on merge (not on every PR push) balances thoroughness with developer speed. If E2E tests fail on main, treat it as a severity-1 issue --- main should always be deployable.

**On deployment to staging:** Run a smoke test suite --- a subset of E2E tests covering the most critical flows --- against the deployed staging environment. This catches deployment-specific issues (missing environment variables, incorrect service URLs, infrastructure misconfigurations) that local tests cannot detect.

**Coverage thresholds.** Set a minimum coverage target and enforce it in CI. For a mature application, 80% line coverage and 70% branch coverage are reasonable targets. New code should have higher coverage than legacy code --- require 90%+ coverage on files changed in the PR. These numbers are not magic; they exist to prevent the slow erosion of test coverage that happens when "we will add tests later" becomes the norm.

Testing is not overhead. It is the mechanism that lets your team move fast without breaking things. A well-structured testing strategy, matched to your application's architecture and risk profile, pays for itself within weeks of implementation and continues paying dividends for the lifetime of the product.

---

Need help building a testing strategy that fits your application and team? [Contact us](/contact.html) --- we design testing approaches that balance confidence with development speed.
