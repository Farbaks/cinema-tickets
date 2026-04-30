import TicketTypeRequest from "./lib/TicketTypeRequest.js";
import InvalidPurchaseException from "./lib/InvalidPurchaseException.js";
import TicketPaymentService from "../thirdparty/paymentgateway/TicketPaymentService.js";
import SeatReservationService from "../thirdparty/seatbooking/SeatReservationService.js";

const TICKET_PRICES = Object.freeze({
  INFANT: 0,
  CHILD: 15,
  ADULT: 25,
});

const MAX_TICKETS = 25;

export default class TicketService {
  /**
   * Should only have private methods other than the one below.
   */
  #ticketPaymentService;
  #seatReservationService;

  constructor(
    ticketPaymentService = new TicketPaymentService(),
    seatReservationService = new SeatReservationService(),
  ) {
    this.#ticketPaymentService = ticketPaymentService;
    this.#seatReservationService = seatReservationService;
  }

  purchaseTickets(accountId, ...ticketTypeRequests) {
    const ticketCount = this.#countTickets(ticketTypeRequests);

    this.#validatePurchase(accountId, ticketCount);

    const totalCost = this.#calculatePrice(counts);
    const totalSeats = ticketCount.ADULT + ticketCount.CHILD;

    this.#paymentService.makePayment(accountId, totalCost);
    this.#seatService.reserveSeat(accountId, totalSeats);
  }

  #countTickets(requests) {
    let count = { INFANT: 0, CHILD: 0, ADULT: 0 };
    requests.forEach((req) => {
      count[req.getTicketType()] =
        (count[req.getTicketType()] || 0) + req.getNoOfTickets();
    });
    return count;
  }

  #validatePurchase(accountId, ticketCount) {
    if (!Number.isInteger(accountId) || accountId < 1) {
      throw new InvalidPurchaseException("Invalid account ID");
    }

    const total = Object.values(ticketCount).reduce((a, b) => a + b, 0);

    if (total < 1) {
      throw new InvalidPurchaseException("Must purchase at least 1 ticket");
    }

    if (total > MAX_TICKETS) {
      throw new InvalidPurchaseException("Cannot exceed 25 tickets");
    }

    if (ticketCount.ADULT === 0 && (ticketCount.CHILD > 0 || ticketCount.INFANT > 0)) {
      throw new InvalidPurchaseException(
        "Child/Infant tickets require an Adult",
      );
    }

    if (ticketCount.INFANT > ticketCount.ADULT) {
      throw new InvalidPurchaseException("Not enough Adults for Infants");
    }
  }

  #calculatePrice(counts) {
    return (
      TICKET_PRICES.CHILD * count.CHILD + TICKET_PRICES.ADULT * count.ADULT
    );
  }
}
