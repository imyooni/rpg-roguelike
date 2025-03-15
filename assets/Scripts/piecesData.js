export function price(id) {
  const prices = {
      numbers: 20,
      numbers: 25,
      blocked: 10,
      star: 75,
      bubble: 35,
      shop: 55,
      zul: 100,
      reroll: 60,
      colors: 30,
      roman: 35,
      bomb1: 40,
      bomb2: 65,
      bomb3: 35,
      fire: 30,
      rainbow: 55,
      updown: 50,
      multi: 60,
      ice: 30,
  };
  return prices[id];
}
