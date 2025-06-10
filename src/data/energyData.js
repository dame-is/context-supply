// Energy usage data for AI models and everyday activities

export const aiModels = {
  chatgpt: {
    name: "ChatGPT",
    emoji: "🤖",
    description: "GPT-4 language model by OpenAI"
  }
};

export const lifestyleEquivalents = {
  energy: {
    evMile: {
      name: "Electric Vehicle",
      emoji: "🚗",
      value: 0.35, // kWh per mile
      unit: {
        singular: "mile",
        plural: "miles"
      },
      description: "Driving an electric vehicle for one mile"
    },
    googleSearch: {
      name: "Search Engine",
      emoji: "🔍",
      value: 0.0003, // converting 0.3 Wh to kWh
      unit: {
        singular: "search",
        plural: "searches"
      },
      description: "One Google search query"
    },
    acDay: {
      name: "Cooling",
      emoji: "❄️",
      value: 36, // kWh per day
      unit: {
        singular: "day",
        plural: "days"
      },
      description: "Running air conditioning for one day"
    },
    heating: {
      name: "Heating",
      emoji: "🔥",
      value: 60, // kWh per day
      unit: {
        singular: "day",
        plural: "days"
      },
      description: "Heating a home for one day"
    },
    lightbulb: {
      name: "Lightbulb",
      emoji: "💡",
      value: 0.056, // kWh per day
      unit: {
        singular: "day",
        plural: "days"
      },
      description: "Running an LED light bulb for one day"
    },
    kettle: {
      name: "Electric Kettle",
      emoji: "☕️",
      value: 0.5, // kWh per 30 minutes
      unit: {
        singular: "boil",
        plural: "boils"
      },
      description: "Boiling a full kettle of water"
    },
    tv: {
      name: "Television",
      emoji: "📺",
      value: 0.08, // kWh per hour
      unit: {
        singular: "hour",
        plural: "hours"
      },
      description: "Watching television for one hour"
    },
    laptop: {
      name: "Laptop",
      emoji: "💻",
      value: 0.018, // kWh per hour
      unit: {
        singular: "hour",
        plural: "hours"
      },
      description: "Using a laptop for one hour"
    }
  },
  water: {
    toiletFlush: {
      name: "Toilet",
      emoji: "🚽",
      value: 1.6, // Gallons per flush
      unit: {
        singular: "flush",
        plural: "flushes"
      },
      description: "One flush of a standard toilet"
    },
    shower: {
      name: "Shower",
      emoji: "🚿",
      value: 40, // Gallons
      unit: {
        singular: "shower",
        plural: "showers"
      },
      description: "One typical shower"
    },
    corn: {
      name: "Corn",
      emoji: "🌽",
      value: 80, // Gallons
      unit: {
        singular: "ear",
        plural: "ears"
      },
      description: "Growing one ear of corn"
    },
    steak: {
      name: "Steak",
      emoji: "🥩",
      value: 1232, // Gallons
      unit: {
        singular: "steak",
        plural: "steaks"
      },
      description: "Producing one 8-ounce steak"
    },
    chicken: {
      name: "Chicken",
      emoji: "🍗",
      value: 330, // Gallons
      unit: {
        singular: "portion",
        plural: "portions"
      },
      description: "Producing one 8-ounce chicken portion"
    },
    egg: {
      name: "Egg",
      emoji: "🥚",
      value: 50, // Gallons
      unit: {
        singular: "egg",
        plural: "eggs"
      },
      description: "Producing one egg"
    },
    burger: {
      name: "Burger",
      emoji: "🍔",
      value: 616, // Gallons
      unit: {
        singular: "burger",
        plural: "burgers"
      },
      description: "Producing one quarter-pound burger"
    },
    rice: {
      name: "Rice",
      emoji: "🍚",
      value: 12.5, // Gallons
      unit: {
        singular: "cup",
        plural: "cups"
      },
      description: "Producing one cup of rice"
    },
    peanut: {
      // Water reference: https://peanutbureau.ca/the-water-footprint-of-peanuts
      // Per-peanut weight reference: https://health.clevelandclinic.org/benefits-of-nuts
      name: "Peanut",
      emoji: "🥜",
      value: 0.1, // Gallons; based on 3.2 gal/oz and 35 peanuts/oz
      unit: {
        singular: "peanut",
        plural: "peanuts"
      },
      description: "Producing one whole peanut (two halves)"
    }
  }
};

export const defaultQueryCount = 5; 
