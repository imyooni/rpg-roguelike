export function Price(id) {
  let prices = [
    25,
    0, 
    75, 
    35,
    55,
    100,
    60, 
    30,
    35,
    60, 
    30,
    55
  ]
  return prices[id]
}

export function Description(id) {
    let desc = [
        "Combine different pieces to reach a total of 10 points.", // normal
        "A blocked slot—nothing can be placed here.", // blocked
        "This piece can pair with any number to make 10 points.", // star
        "Explodes when a nearby piece is destroyed.", // bubble
        "Refreshes the available pieces in the shop.", // shop
        `Combine "Zul" pieces to get a special reward.`, // zul
        "Gain an extra reroll to refresh empty spaces.", // reroll
        "Match two pieces of the same color to score 10 points.", // colors
        "These pieces change every turn.", // roman
        "Destroys all pieces in a 3x3 area upon activation.", // bomb
        "Randomly destroy nearby pieces.", // fire
        "Transforms certain numbers into colors." // rainbow
      ];      
    return desc[id]
  }