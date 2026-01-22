return {
    id: "ratware", // unique identifier (used in paths like assets/unc/{id}.json)

    name: "Milkers", // display name, shown on card
    description: "A private undetected executor since 2013.",

    external: false, // if it is an external (i.e. not an executor)

    price: "$20.00", // the price to display
    period: "lifetime", // license duration, one of "lifetime" or "monthly"

    platforms: ["windows"], // one of "windows", "mac", "ios", "android"

    // all subfields of traits are optional
    traits: {
        pros: [
            "Undetected since 2013",
            "Has a decompiler",
            "100% sUNC",
        ],
        neutral: [],
        cons: []
    },

    verified: true, // shows a verified badge if true
    premium: false, // shows a premium tag if true

    // TODO: sort out the rest of these values below

    editor: "voxlis.NET", // editor/source of review

    txtColor: "text-blue-500", // tailwind text colour class
    accentColor: "from-green-600 to-green-700", // tailwind gradient color for accents

    info: "", // optional text for "MORE INFO" button (leave empty or omit completely to hide it)
    href: "https://milkers.best", // link for the "more info" button
    priceHref: "https://milkers.best", // link for the buy/purchase button

    warning: false, // show a warning popup before proceeding if true
    warningInfo: "", // warning message text

    hide: false, // if true, hides this card from being rendered
    premium: true // if true, makes the buy button green instead of the default gray. used to promote premium services
}