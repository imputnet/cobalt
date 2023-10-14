import createFilename from "../modules/processing/createFilename.js";

let tests = [
    {
        f: {
            service: 'youtube',
            id: 'MMK3L4W70g4',
            title: "Loossemble (루셈블) - 'Sensitive' MV",
            author: 'Loossemble',
            youtubeDubName: false,
            qualityLabel: '2160p',
            resolution: '3840x2160',
            extension: 'webm',
            youtubeFormat: 'vp9'
        },
        isAudioOnly: false,
        isAudioMuted: false
    },
    {
        f: {
            service: 'youtube',
            id: 'MMK3L4W70g4',
            title: "Loossemble (루셈블) - 'Sensitive' MV",
            author: 'Loossemble',
            youtubeDubName: false,
            qualityLabel: '2160p',
            resolution: '3840x2160',
            extension: 'webm',
            youtubeFormat: 'vp9'
        },
        isAudioOnly: true,
        isAudioMuted: false
    },
    {
        f: {
            service: 'youtube',
            id: 'MMK3L4W70g4',
            title: "Loossemble (루셈블) - 'Sensitive' MV",
            author: 'Loossemble',
            youtubeDubName: false,
            qualityLabel: '2160p',
            resolution: '3840x2160',
            extension: 'webm',
            youtubeFormat: 'vp9'
        },
        isAudioOnly: false,
        isAudioMuted: true
    },
    {
        f: {
            service: 'vimeo',
            id: 'MMK3L4W70g4',
            title: "Loossemble (루셈블) - 'Sensitive' MV",
            author: 'Loossemble',
            qualityLabel: '2160p',
            resolution: '3840x2160',
            extension: 'mp4'
        },
        isAudioOnly: false,
        isAudioMuted: true
    }
]

for (let i = 0; i < tests.length; i++) {
    console.log(`---${i}---`)
    console.log(createFilename(tests[i].f, "classic", tests[i].isAudioOnly, tests[i].isAudioMuted))
    console.log(createFilename(tests[i].f, "basic", tests[i].isAudioOnly, tests[i].isAudioMuted))
    console.log(createFilename(tests[i].f, "pretty", tests[i].isAudioOnly, tests[i].isAudioMuted))
    console.log(createFilename(tests[i].f, "nerdy", tests[i].isAudioOnly, tests[i].isAudioMuted))
}
