function generateFriendlyName() {
    const adjectives = ["Amazing", "Brave", "Calm", "Delightful", "Eager", "Fancy", "Generous"];
    const nouns = ["Lion", "Tiger", "Bear", "Elephant", "Wombat", "Giraffe", "Panda"];

    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];

    // Combining adjective, noun, and a random number for more uniqueness
    return `${randomAdjective}${randomNoun}${Math.floor(1000 + Math.random() * 9000)}`;
}
