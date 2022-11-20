const names = {
    "🎶": "musical_notes",
    "🎬": "clapper_board",
    "💰": "money_bag",
    "🎉": "party_popper",
    "❓": "red_question_mark",
    "✨": "sparkles",
    "🪅": "pinata",
    "🪄": "magic_wand",
    "🐲": "dragon_face",
    "🀄": "dragon_face_wukko",
    "💸": "money_with_wings",
    "⚙️": "gear",
    "☹️": "frowning_face",
    "📋": "clipboard",
    "🎃": "pumpkin",
    "🎄": "christmas_tree",
    "🕯️": "candle",
    "😺": "cat",
    "🐶": "dog",
    "🎂": "cake"
}
let sizing = {
    22: 0.4,
    30: 0.7,
    48: 0.9
}
export default function(emoji, size, disablePadding) {
    if (!size) size = 22;
    let padding = size !== 22 ? `margin-right:${sizing[size] ? sizing[size] : "0.4"}rem;` : ``;
    if (disablePadding) padding = 'margin-right:0!important;';
    if (!names[emoji]) emoji = "❓";
    return `<img class="emoji" height="${size}" width="${size}" style="${padding}" alt="${emoji}" src="emoji/${names[emoji]}.svg">`
}
