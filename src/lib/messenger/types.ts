export interface MessengerMessage {
  id: string;
  mid: string;
  psid: string;
  senderName: string;
  text: string;
  createdAt: string;
  readAt: string | null;
}
