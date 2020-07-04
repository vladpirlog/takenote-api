export interface IRateLimiting {
    request: {
        counter: number;
        unixTime: number;
    };
    email: {
        counter: number;
        unixTime: number;
    };
}
