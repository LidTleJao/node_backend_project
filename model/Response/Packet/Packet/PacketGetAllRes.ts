export interface PacketGetAllRes {
    PID:                 number;
    deals_ID:            number;
    concert_deal_ID:     number;
    ticket_ID:           number;
    ticket_zone:         string;
    type_ticket_ID:      number;
    name_type_ticket:    string;
    number_of_tickets:   number;
    concert_deal_price:  number;
    hotel_deal_ID:       number;
    room_ID:             number;
    room_type_ID:        number;
    type_room:           string;
    room_view_type_ID:   number;
    type_view_name_room: string;
    number_of_rooms:     number;
    hotel_deal_price:    number;
    s_deadline_package:  Date;
    deadline_package:    Date;
}
