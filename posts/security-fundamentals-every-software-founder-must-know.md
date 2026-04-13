# Security Fundamentals Every Software Founder Must Know

You do not need to be a security engineer to run a software company. But you do need to understand security well enough to make informed decisions about risk, allocate resources appropriately, and avoid the mistakes that turn minor vulnerabilities into headline-making breaches. The average cost of a data breach for companies with fewer than 500 employees is $3.31 million. For a startup, that is often an extinction event.

Security is not a feature you add before launch. It is a set of practices embedded in how you build, deploy, and operate software. The good news is that 80% of breaches exploit well-known vulnerabilities with well-known mitigations. You do not need cutting-edge security research. You need consistent application of fundamentals.

## Authentication: Getting the Front Door Right

Authentication is how your application verifies that a user is who they claim to be. It is the first line of defense and the most frequently attacked surface.

**Never build your own authentication system.** This is the most important piece of advice in this entire article. Authentication involves password hashing, session management, token generation, brute force protection, account recovery, multi-factor authentication, and a dozen other components, each with subtle implementation pitfalls that have been exploited in real breaches. Use a proven authentication service: Auth0, Clerk, Firebase Auth, or AWS Cognito. These services handle the complexity, stay current with evolving threats, and cost $0-500/month for most startup-scale applications.

If you must implement authentication in-house (a rare but legitimate requirement for certain regulated industries), follow these non-negotiable rules:

- Hash passwords with bcrypt, scrypt, or Argon2id. Never MD5, never SHA-256 without a salt, never plaintext. Set the work factor high enough that hashing takes 200-500ms on your server hardware. This makes brute force attacks computationally prohibitive.
- Enforce minimum password length of 12 characters. Do not require special characters or uppercase letters, which leads to predictable patterns like "Password1!" that are easy to crack. Length is the strongest factor in password security.
- Implement account lockout after 10 failed attempts with progressive delays (1 minute, 5 minutes, 15 minutes, 1 hour). Pair this with rate limiting at the IP level to prevent distributed brute force attacks.
- Use secure, HTTP-only, SameSite cookies for session management. Do not store session tokens in localStorage, which is vulnerable to XSS attacks.

**Multi-factor authentication (MFA)** should be available for all users and mandatory for administrators. TOTP-based MFA (Google Authenticator, Authy) is the minimum standard. WebAuthn/passkeys are the emerging standard and significantly more phishing-resistant. SMS-based MFA is better than nothing but vulnerable to SIM-swapping attacks.

## Authorization: Controlling Who Can Do What

Authentication confirms identity. Authorization controls access. A system where every authenticated user can access every record, modify every setting, and perform every action is a system where one compromised account leads to total exposure.

**Implement role-based access control (RBAC) from the start.** Even if your initial application has only two roles (admin and user), build the authorization infrastructure to support granular roles. As you add features and user types, you will need roles like: viewer (read-only), editor (modify but not delete), manager (full access within their team), and admin (full system access). Retrofitting RBAC into an application that was built with a flat permission model is a multi-week project that delays other work.

**Enforce authorization on the server, not the client.** Hiding a button in the UI is not access control. A determined user can send API requests directly. Every API endpoint must independently verify that the requesting user has permission to perform the requested action on the requested resource. This is the principle of least privilege applied at the API level.

**Check object-level permissions, not just role-level permissions.** A common vulnerability: a user with "editor" role can edit their own records. The API checks that the user has the editor role but does not check whether they own the specific record being edited. The user changes the record ID in the API request and edits someone else's data. This is called an Insecure Direct Object Reference (IDOR) and it is consistently in the OWASP Top 10 because it is consistently overlooked.

Fix this by checking both role permission AND resource ownership on every request: "Does this user have the editor role?" AND "Does this user have access to record #12345?"

## Data Protection: Encryption, Backups, and Access Controls

The data your application stores is the asset you are protecting. If an attacker gets your code, you can redeploy. If they get your data, the damage is done.

**Encrypt data at rest and in transit.** All communication between your users and your servers should use TLS 1.2 or 1.3 (HTTPS). All data stored in databases, file storage, and backups should be encrypted at rest using AES-256. This is default behavior in most cloud providers (AWS RDS, Google Cloud SQL, Azure SQL) but verify that it is enabled, not optional.

**Identify and isolate sensitive data.** Not all data has the same sensitivity. A user's display name is low-sensitivity. Their email address is medium. Their password hash, SSN, financial records, and health information are high-sensitivity. High-sensitivity data should receive additional protection: field-level encryption (so a database dump does not expose plaintext values), restricted access logging, and retention policies that automatically purge data after its useful life.

**Automated, tested backups.** Back up your database at least daily. Store backups in a different region than your primary database (so a regional outage does not take both). Encrypt backups. And critically: test your backup restoration process quarterly. A backup that cannot be restored is not a backup. We have seen companies discover during an actual incident that their backup restoration process fails because of a configuration change made months ago that nobody tested.

**Secrets management.** Database credentials, API keys, encryption keys, and third-party service tokens should never appear in source code, environment files committed to version control, or Slack messages. Use a secrets manager: AWS Secrets Manager, HashiCorp Vault, Doppler, or the secrets management built into your deployment platform (Vercel, Railway, Render). Rotate secrets at least quarterly, and immediately when an employee with access leaves the company.

## Dependency Security: The Code You Did Not Write

Modern applications are built on hundreds of open source dependencies. A typical Node.js application has 500-1,500 transitive dependencies. Each one is code written by someone outside your organization that runs with the same permissions as your own code. A vulnerability in any dependency is a vulnerability in your application.

**Automate dependency scanning.** Enable GitHub Dependabot, Snyk, or Socket.dev to scan your dependency tree continuously and alert you to known vulnerabilities. Configure automatic pull requests for security patches so that critical fixes can be merged quickly.

**Update dependencies regularly.** Falling multiple major versions behind makes updates painful and risky, which leads to further delays. A monthly cadence for minor and patch updates, and a quarterly cadence for major updates, prevents dependency debt from accumulating.

**Audit before adopting.** Before adding a new dependency to your project, check: How many weekly downloads does it have? (Below 1,000 is a risk signal.) When was it last updated? (More than 12 months ago is concerning.) How many maintainers does it have? (Single-maintainer packages are a bus-factor risk.) Are there open security advisories? A five-minute check before `npm install` prevents hours of remediation later.

**Lock your dependency versions.** Use lock files (package-lock.json, yarn.lock, Pipfile.lock) and commit them to version control. This ensures that every developer and every deployment uses the exact same dependency versions, preventing the "works on my machine" problem and ensuring that a compromised package update does not silently enter your build.

## Infrastructure Security: Hardening Your Deployment Environment

The most secure application code is irrelevant if the server it runs on is misconfigured.

**Minimize your attack surface.** Every open port, every running service, and every accessible endpoint is a potential entry point. If your application only needs ports 80 (HTTP) and 443 (HTTPS), close everything else. If you use a managed database service, restrict access to only your application servers' IP addresses using security groups or firewall rules.

**Use managed services wherever possible.** Running your own servers means taking responsibility for OS patching, network configuration, and security monitoring. Managed services (AWS RDS, Cloud Run, Vercel, Railway) handle these responsibilities at a scale and expertise level that a startup engineering team cannot match. Every server you do not manage is a server you do not need to secure.

**Implement logging and monitoring.** Log every authentication event (login, logout, failed attempt), every authorization failure (user tried to access a resource they do not have permission for), every data modification (who changed what, when), and every system error. Ship these logs to a centralized logging service (Datadog, CloudWatch, Papertrail) where they can be searched and alerted on.

Set up alerts for: more than 50 failed login attempts in 5 minutes (brute force attack), any successful login from a new country for an admin account, database queries exceeding normal volume by 10x (possible data exfiltration), and any 500-series error rate exceeding baseline by 3x.

## Building a Security-Aware Culture Without a Security Team

Most startups cannot afford a dedicated security team. That is fine. What you need is a culture where security is part of how everyone builds, not a separate function that reviews things after the fact.

**Security checklist for every pull request.** Add a checklist to your PR template: Does this change handle user input safely? Are new endpoints properly authorized? Are secrets stored securely? Does this change introduce any new dependencies? A simple checklist catches 50% of security issues before they reach production.

**Quarterly security review.** Every quarter, spend half a day reviewing: Are all dependencies up to date? Are all secrets rotated? Are backup restorations tested? Are access permissions still appropriate (especially for employees who changed roles)? Are any new compliance requirements triggered by recent features?

**Incident response plan.** Before a breach happens, define: Who is responsible for leading the response? How do you communicate with affected users? What is the technical process for containing the breach? Who handles legal and regulatory notification? A one-page incident response plan that everyone has read is infinitely better than improvising during a crisis.

---

At The Proper Motion Company, we build security into every application from the first commit. If you need a security audit of your existing application or want to ensure your new product is built on a secure foundation, [reach out to our team](/contact.html).
