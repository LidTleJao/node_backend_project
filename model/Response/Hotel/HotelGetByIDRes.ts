export interface HotelGetByIDRes {
    HID:                 number;
    hotel_user_ID:       number;
    name_user:           string;
    hotel_type_ID:       number;
    typename_hotel:      string;
    name:                string;
    address:             string;
    detail:              string;
    latitude:            number;
    longtitude:          number;
    datetime_addhotel:   Date;
    HRID:                number;
    hotel_ID:            number;
    price:               number;
    Number_of_guests:    number;
    Number_of_rooms:     number;
    room_type_ID:        number;
    type_room:           string;
    room_view_type_ID:   number;
    type_view_name_room: string;
    room_status_ID:      number;
    status_name_room:    string;
}
