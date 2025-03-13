export function vocab(language) {
    return {
        eng: {
            newGameVocab: "New Game",
            optionsVocab: "Options",
            exitVocab: "Exit",
            goal: "Goal",
            day: "Day", //current day ex: day 1
            endDay: "End Day", // finish current day
            shop: "Shop",
        },
        kor: {
            newGameVocab: "새 게임",
            optionsVocab: "옵션",
            exitVocab: "종료",
            goal: "목표",
            day: "일", // current day ex: 일 1
            endDay: "일 종료", // finish current day
            shop: "상점",
        }
    }[language]; // Return correct language object
}
