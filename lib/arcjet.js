import arcjet, { tokenBucket } from "@arcjet/next";


const aj= arcjet({
    key: process.env.ARCJET_KEY,
    characteristics: ["userId"],
    rules:[
        tokenBucket({
            mode:"LIVE",
            refillRate: 10,
            interval: 60,
            capacity: 20,
        }),
    ],
});

export default aj;