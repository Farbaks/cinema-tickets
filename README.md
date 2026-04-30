# Cinema Tickets — DWP Technical Assessment

## Overview
A JavaScript implementation of a cinema ticket booking service that handles ticket purchasing, payment processing, and seat reservation.

---

## Getting Started

### Prerequisites
- Node.js (v20 or higher)
- npm

### Installation
```bash
npm install
npm test
```

---

## Assumptions

The following assumptions were made:

1. **Infant/Adult ratio** — The brief states infants sit on an Adult's lap. A strict 1:1 ratio has been enforced, as it is not physically logical for multiple infants to share a single lap. Therefore the number of Infant tickets cannot exceed the number of Adult tickets.

2. **Account ID validation** — The brief states all accounts with an ID greater than zero are valid. It has been assumed the account ID must also be a whole number (integer), as a fractional ID such as `1.5` would not represent a valid account.

3. **Ticket counts** — It is assumed that a ticket request for 0 tickets of any type is effectively ignored, however the overall purchase must still contain at least 1 valid ticket.

4. **Infant pricing** — Infants are charged £0 and this is intentionally excluded from the payment calculation, consistent with the brief.

5. **External services** — The `TicketPaymentService` and `SeatReservationService` are treated as reliable external providers. No error handling has been added around their calls, in line with the brief's guarantee that payment and reservation will always succeed.

---

## Design Decisions

### Dependency Injection
The `TicketService` accepts `TicketPaymentService` and `SeatReservationService` as constructor parameters, following the Inversion of Control principle. Default instances are provided so the class works without arguments in production, while allowing mock services to be injected in tests.

```javascript
const service = new TicketService(); // production
const service = new TicketService(mockPayment, mockSeats); // testing
```

### Private Methods
All internal logic is encapsulated in private methods (`#validatePurchase`, `#countTickets`, `#calculatePrice`), keeping the public interface limited to `purchaseTickets` as required by the brief.

### Named Constants
Ticket prices and the maximum ticket limit are defined as named constants at the module level. `Object.freeze()` is used on the prices object to prevent accidental mutation at runtime.

```javascript
const TICKET_PRICES = Object.freeze({ INFANT: 0, CHILD: 15, ADULT: 25 });
const MAX_TICKETS = 25;
```

In a production system, these values would likely be driven by a database or external configuration service.

### Custom Exception
`InvalidPurchaseException` extends the native `Error` class with a descriptive `name` property, ensuring clear and identifiable error messages when invalid purchase requests are made.

---

## Test Coverage

| Scenario | Test |
|---|---|
| Account ID of 0 throws | ✅ |
| Non-integer account ID throws | ✅ |
| 0 tickets purchased throws | ✅ |
| Exceeding 25 tickets throws | ✅ |
| Exactly 25 tickets is valid | ✅ |
| Child without Adult throws | ✅ |
| Infant without Adult throws | ✅ |
| More Infants than Adults throws | ✅ |
| Correct payment amount — Adults only | ✅ |
| Correct payment amount — Adults and Children | ✅ |
| Correct payment amount — Mixed ticket types | ✅ |
| Correct seat count — Adults only | ✅ |
| Correct seat count — Adults and Children | ✅ |
| Correct seat count — Mixed ticket types | ✅ |