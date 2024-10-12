export interface ConcertDealPostReq {
  ticket_ID : number;
  status_ID: number;
  number_of_tickets: number;
  price: number;
  s_datetime: string;
  e_datetime: string;
}
