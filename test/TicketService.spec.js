import TicketTypeRequest from "../src/pairtest/lib/TicketTypeRequest";
import TicketService from "../src/pairtest/TicketService";

describe("Ticket Service Test", () => {
  const mockTicketPayment = { makePayment: jest.fn() };
  const mockSeatReservation = { reserveSeat: jest.fn() };
  const service = new TicketService(mockTicketPayment, mockSeatReservation);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Ticket Validation test", () => {
    test("Account ID must be a number greater than 0", () => {
      expect(() =>
        service.purchaseTickets(0, new TicketTypeRequest("ADULT", 8)),
      ).toThrow("Invalid account ID");
    });

    test("Account ID must be an integer", () => {
      expect(() =>
        service.purchaseTickets(1.5, new TicketTypeRequest("ADULT", 1)),
      ).toThrow("Invalid account ID");
    });

    test("At least 1 ticket must be purchased", () => {
      expect(() =>
        service.purchaseTickets(1, new TicketTypeRequest("ADULT", 0)),
      ).toThrow("Must purchase at least 1 ticket");
    });

    test("Total tickets purchased must not exceed 25", () => {
      expect(() =>
        service.purchaseTickets(
          1,
          new TicketTypeRequest("ADULT", 10),
          new TicketTypeRequest("CHILD", 16),
        ),
      ).toThrow("Cannot exceed 25 tickets");
    });

    test("Exactly 25 tickets is valid", () => {
      expect(() =>
        service.purchaseTickets(1, new TicketTypeRequest("ADULT", 25)),
      ).not.toThrow();
    });

    test("At least one adult ticket must be purchased with child/infant ticket ", () => {
      expect(() =>
        service.purchaseTickets(
          1,
          new TicketTypeRequest("ADULT", 0),
          new TicketTypeRequest("CHILD", 16),
        ),
      ).toThrow("Child/Infant tickets require an Adult");

      expect(() =>
        service.purchaseTickets(
          1,
          new TicketTypeRequest("ADULT", 0),
          new TicketTypeRequest("INFANT", 2),
        ),
      ).toThrow("Child/Infant tickets require an Adult");

      expect(() =>
        service.purchaseTickets(
          1,
          new TicketTypeRequest("ADULT", 0),
          new TicketTypeRequest("INFANT", 2),
          new TicketTypeRequest("CHILD", 1),
        ),
      ).toThrow("Child/Infant tickets require an Adult");
    });

    test("Infant tickets cannot be purchased without an Adult", () => {
      expect(() =>
        service.purchaseTickets(1, new TicketTypeRequest("INFANT", 1)),
      ).toThrow("Child/Infant tickets require an Adult");
    });

    test("There must be an adult for every infant ticket", () => {
      expect(() =>
        service.purchaseTickets(
          1,
          new TicketTypeRequest("ADULT", 4),
          new TicketTypeRequest("INFANT", 16),
        ),
      ).toThrow("Not enough Adults for Infants");
    });
  });

  describe("Payment Service test", () => {
    test("Payment Service is called with the right amount for only adult tickets", () => {
      service.purchaseTickets(1, new TicketTypeRequest("ADULT", 4));

      expect(mockTicketPayment.makePayment).toHaveBeenCalledWith(1, 100);
    });

    test("Payment Service is called with the right amount for adult and child tickets", () => {
      service.purchaseTickets(
        1,
        new TicketTypeRequest("ADULT", 10),
        new TicketTypeRequest("CHILD", 4),
      );

      expect(mockTicketPayment.makePayment).toHaveBeenCalledWith(1, 310);
    });

    test("Payment Service is called with the right amount for all ticket types", () => {
      service.purchaseTickets(
        1,
        new TicketTypeRequest("ADULT", 10),
        new TicketTypeRequest("CHILD", 4),
        new TicketTypeRequest("INFANT", 10),
      );

      expect(mockTicketPayment.makePayment).toHaveBeenCalledWith(1, 310);
    });
  });

  describe("Seat Reservation Service test", () => {
    test("Seat Reservation Service is called with the right number of seats for only adult tickets", () => {
      service.purchaseTickets(1, new TicketTypeRequest("ADULT", 4));

      expect(mockSeatReservation.reserveSeat).toHaveBeenCalledWith(1, 4);
    });

    test("Seat Reservation Service is called with the right number of seats for adult and child tickets", () => {
      service.purchaseTickets(
        1,
        new TicketTypeRequest("ADULT", 10),
        new TicketTypeRequest("CHILD", 4),
      );

      expect(mockSeatReservation.reserveSeat).toHaveBeenCalledWith(1, 14);
    });

    test("Seat Reservation Service is called with the right number of seats for all ticket types", () => {
      service.purchaseTickets(
        1,
        new TicketTypeRequest("ADULT", 10),
        new TicketTypeRequest("CHILD", 5),
        new TicketTypeRequest("INFANT", 10),
      );

      expect(mockSeatReservation.reserveSeat).toHaveBeenCalledWith(1, 15);
    });
  });
});
