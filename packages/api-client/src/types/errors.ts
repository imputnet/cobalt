export enum CobaltAuthError {
    JWTMissing = 'error.api.auth.jwt.missing',
    JWTInvalid = 'error.api.auth.jwt.invalid',
    TurnstileMissing = 'error.api.auth.turnstile.missing',
    TurnstileInvalid = 'api.auth.turnstile.invalid'
};

export enum CobaltReachabilityError {
    Unreachable = 'error.api.unreachable',
    TimedOut = 'error.api.timed_out',
    RateExceeded = 'error.api.rate_exceeded',
    AtCapacity = 'error.api.capacity'
};

export enum CobaltGenericError {
    Generic = 'error.api.generic',
    UnknownResponse = 'error.api.unknown_response'
};

export enum CobaltServiceError {
    Unsupported = 'error.api.service.unsupported',
    Disabled = 'error.api.service.disabled'
};

export enum CobaltLinkError {
    Invalid = 'error.api.link.invalid',
    FormatUnsupported = 'error.api.link.unsupported'
};

export enum CobaltProcessingError {
    Fail = 'error.api.fetch.fail',
    Critical = 'error.api.fetch.critical',
    Empty = 'error.api.fetch.empty',
    RateLimited = 'error.api.fetch.rate',
    ShortLink = 'error.api.fetch.short_link'
};

export enum CobaltContentError {
    TooLong = 'error.api.content.too_long',

    VideoUnavailable = 'error.api.content.video.unavailable',
    VideoIsLive = 'error.api.content.video.live',
    VideoIsPrivate = 'error.api.content.video.private',
    VideoIsAgeRestricted = 'error.api.content.video.age',
    VideoIsRegionRestricted = 'error.api.content.video.region',

    PostUnavailable = 'error.api.content.post.unavailable',
    PostIsPrivate = 'error.api.content.post.private',
    PostIsAgeRestricted = 'error.api.content.post.age',
};

export enum CobaltYouTubeError {
    MissingCodec = 'error.api.youtube.codec',
    CannotDecipher = 'error.api.youtube.decipher',
    MissingLogin = 'error.api.youtube.login',
    TokenExpired = 'error.api.youtube.token_expired'
}

export type CobaltAPIErrorCode = CobaltAuthError
                               | CobaltReachabilityError
                               | CobaltGenericError
                               | CobaltServiceError
                               | CobaltLinkError
                               | CobaltProcessingError
                               | CobaltContentError
                               | CobaltYouTubeError;
