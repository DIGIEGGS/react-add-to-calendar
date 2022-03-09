export interface IEvent {
  title: string;
  description: string;
  location: string;
  startTime: string;
  endTime: string;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    opera: any;
  }
}
