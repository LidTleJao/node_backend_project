export interface GetConcertTicketByCIDRes {
    CTID:              number;
    concert_ID:        number;
    name_concert:      string;
    show_ID:           number;
    show_concert:      Date;
    time_show_concert: string;
    type_ticket_ID:    number;
    name_type_ticket:  string;
    ticket_zone:       string;
    price:             number;
}
