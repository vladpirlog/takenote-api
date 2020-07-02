export interface IRateLimiting {
    requests: {
        counter: number;
        unixTime: number;
    };
    email: {
        counter: number;
        unixTime: number;
    };
}
