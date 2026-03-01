// src/constants/mockData.js

export const EXAM_SESSION = {
  id: "exam-001",
  title: "Reading Comprehension Exam",
  totalTime: 5400, // 90 minutes
  passages: [
    {
      id: "p1",
      title: "Folk Lore",
      points: 10,
      content: [
        "In the small town of San Jose, the tradition of Bayanihan was alive. Neighbors would literally carry a bamboo house on their shoulders to help a friend move. It was a beautiful sight of unity and heavy lifting.",
        "Now, many families from San Jose have moved to big, crowded apartments in Manila. There are no bamboo houses to carry here. Everyone stays behind locked gates and metal doors. Some say that Bayanihan is dead because the city is too busy and small for such a big tradition.",
        "However, last week, when a massive flood hit the street, the neighbors didn't wait for rescue boats. They tied their laundry ropes together to create a safety line for the children. They shared their remaining clean water with strangers. The bamboo houses were gone, but the shoulders were still there.",
      ],
      questions: [
        {
          id: "q1-1",
          text: "What does \"but the shoulders were still there\" mean?",
        },
        {
          id: "q1-2",
          text: "Based on the passage, is Bayanihan dead? Why or why not?",
        },
      ],
    },
    {
      id: "p2",
      title: "The Last Firefly",
      points: 10,
      content: [
        "Every summer, children in the barrio used to chase fireflies after dinner. The blinking lights filled the fields like a sky fallen to earth. Parents called it \"nature's disco,\" and grandparents said the fireflies carried the wishes of the ancestors.",
        "This summer, Mira searched the entire field behind her grandmother's house. She found only one firefly, blinking alone near the old mango tree. She cupped it gently in her hands. Its light pulsed slowly, as if tired.",
        "Mira released it toward the sky and whispered, \"Tell them we're still here.\" The firefly blinked twice, then disappeared into the dark.",
      ],
      questions: [
        {
          id: "q2-1",
          text: "Why do you think there was only one firefly left? Use details from the passage.",
        },
        {
          id: "q2-2",
          text: "What do you think Mira meant by \"Tell them we're still here\"?",
        },
      ],
    },
    {
      id: "p3",
      title: "The Bridge Builders",
      points: 10,
      content: [
        "For sixty years, the old wooden bridge was the only way to cross the river that divided the two villages of Mabini and Rizal. Children from both sides went to the same school, crossing the bridge each morning together.",
        "When the bridge collapsed during a storm, the two villages stopped speaking. Children from Mabini went to a new school in the north. Children from Rizal went south. Within a year, they had forgotten each other's names.",
        "Ten years later, a young engineer named Dani — who had crossed that old bridge as a child — returned to rebuild it. On the day it opened, an old woman from Mabini and an old man from Rizal met in the middle. They did not speak. They just stood there, watching the river below.",
      ],
      questions: [
        {
          id: "q3-1",
          text: "How did the collapse of the bridge affect the relationship between the two villages?",
        },
        {
          id: "q3-2",
          text: "What is the significance of the old woman and old man standing in the middle of the bridge without speaking?",
        },
      ],
    },
    {
      id: "p4",
      title: "Rice and Remembrance",
      points: 10,
      content: [
        "Every harvest season, Lola Caring would cook a pot of sinangag using the first rice of the crop. She said the first rice was always the sweetest because it still remembered the rain.",
        "Her granddaughter Bea never understood this until the year Lola Caring passed away. That harvest, Bea cooked the rice herself, following the steps she had watched a hundred times. When she lifted the lid, the steam hit her face and suddenly she was six years old again, sitting on a wooden stool in the kitchen.",
        "She didn't cry until she tasted it. It was not the same. But it was close enough to hurt.",
      ],
      questions: [
        {
          id: "q4-1",
          text: "What did Lola Caring mean when she said the first rice \"still remembered the rain\"?",
        },
        {
          id: "q4-2",
          text: "Why was the taste of the rice both comforting and painful for Bea?",
        },
      ],
    },
  ],
};

export const LESSON_SESSION = {
  id: "lesson-001",
  title: "Reading Comprehension Lesson",
  passages: [
    {
      id: "p1",
      title: "The Bayanihan Spirit in the City",
      difficulty: "Easy",
      content: [
        "In the small town of San Jose, the tradition of Bayanihan was alive. Neighbors would literally carry a bamboo house on their shoulders to help a friend move. It was a beautiful sight of unity and heavy lifting.",
        "Now, many families from San Jose have moved to big, crowded apartments in Manila. There are no bamboo houses to carry here. Everyone stays behind locked gates and metal doors. Some say that Bayanihan is dead because the city is too busy and small for such a big tradition.",
        "However, last week, when a massive flood hit the street, the neighbors didn't wait for rescue boats. They tied their laundry ropes together to create a safety line for the children. They shared their remaining clean water with strangers. The bamboo houses were gone, but the shoulders were still there.",
      ],
      questions: [
        {
          id: "q1-1",
          text: "Based on that, what do you think moving about moving a house?",
        },
        {
          id: "q1-2",
          text: "What do you think the author means by \"the shoulders were still there\"?",
        },
      ],
    },
    {
      id: "p2",
      title: "The Last Firefly",
      difficulty: "Medium",
      content: [
        "Every summer, children in the barrio used to chase fireflies after dinner. The blinking lights filled the fields like a sky fallen to earth.",
        "This summer, Mira searched the entire field behind her grandmother's house. She found only one firefly, blinking alone near the old mango tree. She cupped it gently in her hands, its light pulsing slowly — as if tired.",
        "Mira released it toward the sky and whispered, \"Tell them we're still here.\" The firefly blinked twice, then disappeared into the dark.",
      ],
      questions: [
        {
          id: "q2-1",
          text: "How do you think Mira felt when she found only one firefly? Why?",
        },
        {
          id: "q2-2",
          text: "Who do you think \"them\" refers to in Mira's whisper?",
        },
      ],
    },
    {
      id: "p3",
      title: "Rice and Remembrance",
      difficulty: "Hard",
      content: [
        "Every harvest season, Lola Caring would cook a pot of sinangag using the first rice of the crop. She said the first rice was always the sweetest because it still remembered the rain.",
        "Her granddaughter Bea never understood this until the year Lola Caring passed away. That harvest, Bea cooked the rice herself. When she lifted the lid, the steam hit her face and suddenly she was six years old again, sitting on a wooden stool in the kitchen.",
        "She didn't cry until she tasted it. It was not the same. But it was close enough to hurt.",
      ],
      questions: [
        {
          id: "q3-1",
          text: "What do you think Lola Caring meant when she said the rice \"still remembered the rain\"?",
        },
        {
          id: "q3-2",
          text: "Why was the taste both comforting and painful for Bea?",
        },
      ],
    },
  ],
};

export const EXPLORE_SESSION = {
  mode: "explore",
  streak: 3,
  title: "The Strength of Unity",
  passages: [
    {
      id: 1,
      title: "Community Power",
      content:
        "During the typhoon, the villagers helped each other rebuild homes.",
      questions: [
        {
          id: 301,
          text: "What does this story teach about cooperation?"
        }
      ]
    }
  ]
};