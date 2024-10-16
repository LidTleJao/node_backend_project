export interface UpdateConcertTicketPostReq{
    CTID: number;
    concert_ID : number;
    type_ticket_ID :number;
    ticket_zone: string;
    price: number;
}