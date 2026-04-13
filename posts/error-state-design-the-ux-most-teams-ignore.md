# Error State Design: The UX Most Teams Ignore

Every software team spends months perfecting the happy path -- the flow where everything works. The onboarding is smooth, the dashboard loads instantly, the payment goes through on the first try. But the moment something goes wrong -- a network request fails, a form has invalid input, a third-party service is down, or the user lacks permission to perform an action -- most applications fall apart. They show cryptic error codes, generic "Something went wrong" messages, or worst of all, nothing at all.

Error states are not edge cases. In production, they are a guaranteed part of the user experience. Network requests fail roughly 1-3 percent of the time on mobile connections. Form submissions are rejected 15-30 percent of the time due to validation issues. Third-party API calls timeout occasionally, payment transactions get declined, and users inevitably try to do things they are not allowed to do. If your application handles these situations poorly, a significant portion of your users are having a bad experience that your analytics might never capture.

## Classifying Errors by User Recoverability

Not all errors are the same, and they should not be communicated the same way. The most useful classification is based on whether the user can do something about it.

**User-recoverable errors** are problems the user can fix. A form field has an invalid email format. A password does not meet complexity requirements. A file upload exceeds the size limit. A search query returns no results. For these, the error message must tell the user exactly what is wrong and exactly how to fix it. "Please enter a valid email address" is mediocre. "Email addresses must include an @ symbol and a domain (e.g., name@company.com)" is better. "Invalid input" is a failure of design.

**System-recoverable errors** are problems the system can fix without user intervention, usually by retrying. A network request that times out, a database connection that drops momentarily, a rate-limited API call -- these should be retried automatically (with exponential backoff) before the user ever sees an error. If three retries fail, then surface the error, but the first attempt should be invisible. Most teams surface these errors immediately, which trains users to develop a "refresh and hope" habit that should not be necessary.

**Non-recoverable errors** are situations where neither the user nor the system can fix the problem right now. The service is down, the user's account is suspended, the requested resource has been deleted. For these, the error state should clearly explain the situation, set expectations for resolution ("Our team has been notified and is working on a fix"), and offer an alternative path ("In the meantime, you can...").

Design each category differently. User-recoverable errors appear inline, close to the element that needs attention, in a warm color (orange or amber) that signals "action needed" without panic. System errors appear as banners or toast notifications that acknowledge the problem without blocking the user's workflow. Non-recoverable errors can take over the screen because there is genuinely nothing else the user can do on this page.

## Form Validation: Where Most Error UX Fails

Forms are the most error-prone interaction in any application, and most teams get the validation UX wrong in at least three ways.

**Timing**: Showing validation errors as the user types is annoying. Showing them only on form submission is too late. The optimal pattern is validate on blur (when the user leaves a field) for individual field validation, and validate on submit for cross-field rules (e.g., "end date must be after start date"). This gives the user immediate feedback after they have had a chance to complete their input, without interrupting them mid-thought.

**Placement**: Error messages should appear directly below the field they relate to, not in a summary banner at the top of the form. Research by the Baymard Institute found that inline validation errors reduce form completion time by 22 percent compared to summary-only error display. Users should not have to scroll up to read an error, then scroll back down to find the problematic field.

**Specificity**: Every validation rule should have a unique, human-readable error message. "This field is required" is a missed opportunity. "Company name is required to create your account" tells the user both what is missing and why it matters. For complex validation rules, explain the constraint: "Password must be at least 12 characters and include one number" rather than "Password does not meet requirements."

Here is a concrete implementation detail that saves time: define validation messages at the field level in your form configuration, not in the validation logic. This makes it easy to review and update all error messages in one place, ensures consistency, and enables localization without touching business logic.

For multi-step forms or wizards, validate the current step before allowing the user to proceed. Do not let someone fill out four steps of a form only to discover that Step 1 had a validation error. The step indicator should show a red marker on any step with unresolved errors, and clicking it should navigate back to that step with the errors highlighted.

## Network and Loading Failures

Network errors are the most common system-level failure that users encounter, especially on mobile connections. The standard approach -- showing a generic error toast and hoping the user retries -- is inadequate.

For read operations (loading a page, fetching data), implement a layered fallback strategy. First, show cached or stale data if available. A dashboard that shows data from five minutes ago with a "Last updated: 10:42 AM" indicator is infinitely better than a blank page with an error message. Second, if no cached data exists, show a skeleton screen with a retry button and a clear message: "Unable to load your projects. Check your connection and try again." Third, for critical pages, implement offline support that stores the last successful response in local storage or IndexedDB and serves it when the network is unavailable.

For write operations (submitting a form, saving changes, processing a payment), the stakes are higher because the user might lose their input. Implement optimistic saving: save form state to local storage as the user types, so if a submission fails, their input is preserved. Show the error with a "Retry" button that resubmits without requiring the user to re-enter anything. If the submission was partially successful (the order was created but the confirmation email failed), tell the user exactly what happened: "Your order was placed successfully. We were unable to send a confirmation email -- you can view your order at [link]."

Timeout handling deserves special attention. If an API call has been pending for more than 10 seconds, show a message: "This is taking longer than usual. You can wait or try again later -- your data has been saved." The 10-second threshold is not arbitrary; research by Nielsen Norman Group established that 10 seconds is the limit at which users begin to lose attention and wonder if the system is frozen.

## Permission and Authorization Errors

A user clicks a button and sees "403 Forbidden" or "You do not have permission to perform this action." This is technically accurate and completely unhelpful. Permission errors need to answer three questions: what were you trying to do, why can you not do it, and what should you do instead.

A well-designed permission error for a team member trying to access billing settings might read: "Billing settings are available to account administrators. You are currently a Team Member. Ask your administrator, Sarah Chen (sarah@company.com), to either grant you admin access or make this change for you."

Even better, do not show the button in the first place. If a user does not have permission to perform an action, hide or disable the UI element that triggers it. A disabled button with a tooltip explaining "Available on the Pro plan" or "Only administrators can edit billing" prevents the error entirely while still communicating what is possible.

There is a nuance here: hiding elements completely can confuse users who expect to see them. Disabling with an explanation is usually better because it confirms the feature exists and tells the user how to access it. The exception is security-sensitive actions -- do not show an "Admin Panel" link to non-admin users, even disabled, as it reveals the existence of a surface that should not be visible.

For feature-gated errors (the user's plan does not include this feature), the error state is actually a sales opportunity. "Custom reports are available on the Pro plan. Upgrade to unlock advanced reporting, API access, and priority support." Include a direct link to the upgrade flow. This pattern converts 3-8 percent of users who encounter it, according to data from SaaS pricing studies.

## Empty States as Error Prevention

Empty states are the zero-data version of an error state, and they are chronically under-designed. A blank table, an empty chart, a dashboard with no widgets -- these are not errors, but users experience them as something being wrong.

Every empty state should answer the question: "Why is this empty, and what do I do about it?" A project list for a new user should say "You have not created any projects yet" and offer a prominent "Create your first project" button. A search with no results should suggest alternative queries, check for typos, or recommend broadening the filters. An analytics dashboard with no data should explain what actions will generate data: "Analytics will appear here once your first campaign is live."

The most effective empty states use illustration sparingly (a simple icon or a small graphic, not a full-page cartoon), a brief explanatory sentence, and a clear primary action. Keep the tone helpful, not cute. "Looks like there is nothing here yet!" is a wasted opportunity. "No invoices match your filters. Try adjusting the date range or clearing the status filter." is useful.

For SaaS onboarding, empty states are your first impression. The first thing a new user sees after signing up is a series of empty states -- an empty dashboard, an empty contact list, an empty project board. If these screens feel barren and confusing, the user may never come back. If they guide the user toward their first meaningful action, they become the start of a productive experience.

## Building an Error Taxonomy for Your Product

Rather than handling errors ad hoc, build a structured error taxonomy that your entire team uses. Define categories (validation, network, permission, system, external service), severity levels (informational, warning, error, critical), and for each combination, define the default UI treatment (inline message, toast, banner, full-page), tone (neutral, helpful, urgent), and recovery path (retry, fix input, contact support, wait).

Document this taxonomy in your design system alongside your component library. Create reusable error components for each treatment: an InlineError component for form validation, a Toast component for transient notifications, a Banner component for persistent system messages, and a FullPageError component for unrecoverable states. Each component should accept a message, an optional recovery action (button with label and callback), and a severity level that determines its visual treatment.

When a new feature is being designed, require error state mockups alongside the happy-path mockups. Make "what happens when this fails?" a standard question in design reviews. The cost of designing error states upfront is trivial compared to the cost of discovering poor error handling in production through user complaints or silent churn.

---

Error states are not a polish pass -- they are a fundamental part of product design that directly affects user trust, task completion rates, and support costs. An application that handles errors gracefully feels reliable even when things go wrong. An application that handles them poorly feels unreliable even when things go right, because users never quite trust that the system has their back.

If you want to build software that handles the full spectrum of user experience -- not just the happy path -- [connect with our team](/contact.html). We design and build applications that treat error states as first-class citizens, not afterthoughts.
