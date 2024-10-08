export interface ConcertTicketPostReq {
    concert_ID: number;
    show_ID: number;
    type_ticket_ID: number;
    ticket_zone: string;
    price: number;
}