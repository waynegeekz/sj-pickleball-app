# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js, self-hosted (not Vercel). Router, language, database, and auth provider are not yet decided.

## Users

- **Players** of a single pickleball facility who want to reserve a court. They book mostly from their phones, often on the go, and want it done in seconds.
- **Facility staff/admins** who manage courts, hours, and blocked times and need to see who is booked when. Likely at a desk, but not confirmed.

## Product Purpose

A court booking system for one pickleball facility. Players find an open court and time and reserve it; staff keep the schedule accurate. Success means a player can go from opening the site to a confirmed booking faster than with any incumbent tool, and staff spend less time handling bookings by hand.

## Positioning

Simpler and faster than general-purpose booking platforms (CourtReserve, PlayTime Scheduler, and similar). It does one facility's court booking and nothing more, so every step that general tools need for multi-venue, league, or marketplace features can be removed.

## Operating Context

- Players book on mobile web, frequently one-handed and in short sessions.
- Staff work from an admin schedule view: courts, operating hours, blocks, and the booking list.

## Capabilities and Constraints

Confirmed for v1:
- Player accounts: sign in, view booking history, cancel and reschedule.
- Admin schedule: manage courts, hours, and blocks; view bookings.

Not in v1 (do not design or imply them):
- Online payment.
- Memberships, pricing tiers, passes.
- Multiple facilities, marketplace search, leagues, matchmaking, ratings.

Open decisions:
- Facility name, location, number of courts, and operating hours.
- Booking rules: slot length, how far ahead players can book, cancellation window, per-player limits.
- Whether staff can book on behalf of walk-ins or phone callers.

## Brand Commitments

None yet. The facility name and any existing logo or identity are unknown.

## Evidence on Hand

None. No facility copy, photos, logos, testimonials, or usage data exist in the repo. Do not invent a facility name, court count, prices, reviews, or player counts.

## Product Principles

1. **Speed to booking is the product.** Every screen is judged by how many taps it adds between "I want to play" and "booked".
2. **One facility, no generality.** Do not build for multiple venues, sports, or business models that are out of scope.
3. **Phone first for players.** Player flows are designed and verified at phone width before anything else.
4. **The schedule is the truth.** Availability shown to players must always match what staff see; no double bookings, no stale slots.

## Accessibility & Inclusion

No product-specific requirement established. Default to WCAG 2.2 AA, with large touch targets for the mobile booking flow.
