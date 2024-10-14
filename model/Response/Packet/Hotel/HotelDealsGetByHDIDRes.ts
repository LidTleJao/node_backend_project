export interface HotelDealsGetByHDIDRes {
    HDID:                number;
    hotel_user_ID:       number;
    room_ID:             number;
    name:                string;
    room_type_ID:        number;
    type_room:           string;
    room_view_type_ID:   number;
    type_view_name_room: string;
    status_ID:           number;
    name_status:         string;
    price:               number;
    number_of_rooms:     number;
    s_datetime:          Date;
    e_datetime:          Date;
}
