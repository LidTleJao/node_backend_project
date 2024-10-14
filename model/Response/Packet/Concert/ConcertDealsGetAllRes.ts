export interface ConcertDealsGetAllRes {
    CDID:              number;
    ticket_ID:         number;
    name_concert:      string;
    type_ticket_ID:    number;
    name_type_ticket:  string;
    status_ID:         number;
    name_status:       string;
    number_of_tickets: number;
    price:             number;
    s_datetime:        Date;
    e_datetime:        Date;
}
