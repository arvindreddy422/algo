import type { LucideIcon } from "lucide-react";
import { ArrowDownToLine, ArrowUpRight, Columns2, CopyPlus, Divide, Hand, Layers, Plus, Rows3, Split, Square } from "lucide-react";
import type { DrillKind } from "@/lib/math/drills";

export type DiagramKind =
  | "fingers"
  | "digits"
  | "doubling"
  | "halves"
  | "double-three"
  | "seven"
  | "make-ten"
  | "count-up"
  | "split"
  | "carry"
  | "times-eleven"
  | "end-in-five";

export type TrickSection = {
  heading: string;
  paragraphs: string[];
};

export type MathTrick = {
  n: number;
  slug: string;
  short: string;
  title: string;
  blurb: string;
  icon: LucideIcon;
  diagram: DiagramKind;
  sections: TrickSection[];
  chart: string;
  walk: { problem: string; steps: string[] };
  practice: { drill: DrillKind; table?: number };
};

export const mathTricks: MathTrick[] = [
  {
    n: 1,
    slug: "nines-fingers",
    short: "Fingers",
    title: "Nines on your fingers",
    blurb: "Fold one finger. Everything to the left is the tens. Everything to the right is the ones.",
    icon: Hand,
    diagram: "fingers",
    sections: [
      {
        heading: "How to hold them",
        paragraphs: [
          "Hold both hands up, palms facing you. Start at the pinky on your left and count across to the pinky on your right. That is 1 through 10.",
          "To find 9 times a number, fold that finger down. Count the standing fingers on the left of the fold. That count is the tens digit. Count the standing fingers on the right. That count is the ones digit.",
        ],
      },
      {
        heading: "The ends of the row",
        paragraphs: [
          "9 times 1 folds the first finger. Nothing stands on the left, and nine fingers stand on the right, so the product is 9. 9 times 10 folds the last finger. Nine stand on the left and none on the right, so the product is 90.",
        ],
      },
    ],
    chart: `flowchart TD
  hold["Hold both hands up"] --> count["Count 1 to 10 from your left"]
  count --> fold["Fold finger n"]
  fold --> left["Fingers left of the fold are the tens"]
  fold --> right["Fingers right of the fold are the ones"]
  left --> read["Read the two counts as the product"]
  right --> read`,
    walk: {
      problem: "9 × 7",
      steps: [
        "Fold finger 7.",
        "Six fingers stand to the left, so the tens digit is 6.",
        "Three fingers stand to the right, so the ones digit is 3.",
        "9 × 7 = 63.",
      ],
    },
    practice: { drill: "nines" },
  },
  {
    n: 2,
    slug: "nines-digits",
    short: "Digits",
    title: "The two digits of a nine",
    blurb: "The tens digit is one less than the number you multiply. The ones digit is whatever makes the pair add to 9.",
    icon: Columns2,
    diagram: "digits",
    sections: [
      {
        heading: "The pair",
        paragraphs: [
          "For 9 times n, when n is from 1 to 10, write the tens digit as n minus 1. The ones digit is 9 minus that tens digit. Put the two digits side by side.",
          "The two digits always add to 9. If you wrote 9 times 7 as 62, the check fails, because 6 plus 2 is 8. The ones digit has to be 3.",
        ],
      },
      {
        heading: "Why the fingers and the digits agree",
        paragraphs: [
          "Folding finger n leaves n minus 1 fingers on the left. That is the same tens digit. The fingers on the right are the ones digit, and the two groups use up the other nine fingers, so they add to 9.",
        ],
      },
    ],
    chart: `flowchart LR
  fact["9 times n"] --> tens["Tens digit is n minus 1"]
  tens --> ones["Ones digit is 9 minus the tens digit"]
  ones --> check["The two digits add to 9"]`,
    walk: {
      problem: "9 × 7",
      steps: [
        "The tens digit is 7 minus 1, which is 6.",
        "The ones digit is 9 minus 6, which is 3.",
        "6 and 3 add to 9, so the pair is safe.",
        "9 × 7 = 63.",
      ],
    },
    practice: { drill: "nines" },
  },
  {
    n: 3,
    slug: "doubling",
    short: "Doubling",
    title: "Twos, fours, and eights",
    blurb: "Times 2 is a double. Times 4 is that double again. Times 8 is one more double.",
    icon: CopyPlus,
    diagram: "doubling",
    sections: [
      {
        heading: "One move, used three times",
        paragraphs: [
          "Doubling is the only new move. 2 times n is n plus n. 4 times n is the double of that. 8 times n is the double of the four.",
          "You can stop at the table you need. If the question is a 4, do not keep going to the 8. If it is an 8, the 4 is only a step on the way.",
        ],
      },
    ],
    chart: `flowchart LR
  begin["Start with n"] --> two["Double once: n times 2"]
  two --> four["Double again: n times 4"]
  four --> eight["Double again: n times 8"]`,
    walk: {
      problem: "7 × 8",
      steps: [
        "Double 7 once: 7 × 2 = 14.",
        "Double 14: 7 × 4 = 28.",
        "Double 28: 7 × 8 = 56.",
      ],
    },
    practice: { drill: "tables", table: 8 },
  },
  {
    n: 4,
    slug: "fives",
    short: "Fives",
    title: "Fives are half of tens",
    blurb: "Multiply by 10, then take half. That half is the five.",
    icon: Divide,
    diagram: "halves",
    sections: [
      {
        heading: "Ten is the easy one",
        paragraphs: [
          "Times 10 puts a zero on the end. Half of that number is times 5, because 5 is half of 10.",
          "If the tens number is even, the half is a whole number and you are done. 10 times any whole number from 1 to 10 is even, so the half never leaves a remainder in this table.",
        ],
      },
    ],
    chart: `flowchart LR
  ten["n times 10"] --> half["Take half"]
  half --> five["That half is n times 5"]`,
    walk: {
      problem: "6 × 5",
      steps: [
        "6 × 10 = 60.",
        "Half of 60 is 30.",
        "6 × 5 = 30.",
      ],
    },
    practice: { drill: "tables", table: 5 },
  },
  {
    n: 5,
    slug: "threes-sixes",
    short: "Threes",
    title: "Threes, then sixes",
    blurb: "Learn the three. A six is that answer doubled.",
    icon: Layers,
    diagram: "double-three",
    sections: [
      {
        heading: "Six is two threes",
        paragraphs: [
          "6 times n is the same as 3 times n, doubled. If the three is already in your head, the six is one extra double.",
          "The three itself can be counted as n plus n plus n. For a small n that is fast. Once the three is there, do not rebuild the six from scratch.",
        ],
      },
    ],
    chart: `flowchart LR
  three["n times 3"] --> double["Double that answer"]
  double --> six["That is n times 6"]`,
    walk: {
      problem: "8 × 6",
      steps: [
        "8 × 3 = 24.",
        "Double 24.",
        "8 × 6 = 48.",
      ],
    },
    practice: { drill: "tables", table: 6 },
  },
  {
    n: 6,
    slug: "sevens",
    short: "Sevens",
    title: "Sevens are a five plus a two",
    blurb: "7 times n is 5 times n plus 2 times n. You already know both of those.",
    icon: Plus,
    diagram: "seven",
    sections: [
      {
        heading: "Split the seven",
        paragraphs: [
          "Seven is 5 plus 2. So 7 times a number is the five of that number plus the two of that number. The five comes from half of the ten. The two is a double.",
          "Add those two results. That sum is the seven. The split keeps you on facts you can already say quickly.",
        ],
      },
    ],
    chart: `flowchart LR
  five["n times 5"] --> add["Add the two results"]
  two["n times 2"] --> add
  add --> seven["That sum is n times 7"]`,
    walk: {
      problem: "6 × 7",
      steps: [
        "6 × 5 = 30.",
        "6 × 2 = 12.",
        "30 + 12 = 42.",
        "6 × 7 = 42.",
      ],
    },
    practice: { drill: "tables", table: 7 },
  },
  {
    n: 7,
    slug: "make-ten",
    short: "Make ten",
    title: "Add by making ten",
    blurb: "Fill the first number up to ten. Add whatever is left of the second number.",
    icon: Plus,
    diagram: "make-ten",
    sections: [
      {
        heading: "Ten is a landing spot",
        paragraphs: [
          "Look at the first number and ask how many it needs to reach 10. Take that many from the second number. You now have a ten, plus whatever is left.",
          "This is the useful move when one of the numbers is 7, 8, or 9, because the gap to 10 is small. Both numbers in the drill stay between 0 and 20, so the leftover is still a small count.",
        ],
      },
    ],
    chart: `flowchart TD
  see["See a plus b"] --> gap["How many does a need to reach 10"]
  gap --> take["Take that many from b"]
  take --> sum["10 plus what is left of b"]`,
    walk: {
      problem: "8 + 7",
      steps: [
        "8 needs 2 to reach 10.",
        "Take 2 from 7. That leaves 5.",
        "10 + 5 = 15.",
        "8 + 7 = 15.",
      ],
    },
    practice: { drill: "addition" },
  },
  {
    n: 8,
    slug: "count-up",
    short: "Count up",
    title: "Subtract by counting up",
    blurb: "Start at the smaller number and hop to the bigger one. The hops are the difference.",
    icon: ArrowUpRight,
    diagram: "count-up",
    sections: [
      {
        heading: "Hop to ten, then finish",
        paragraphs: [
          "Subtraction asks how far apart the two numbers are. Start at the smaller one. Hop to the next 10, and remember the size of that hop. Then hop from 10 to the bigger number.",
          "Add the hops. That total is the difference. In the drill the bigger number is at most 20 and the smaller one is never larger than it, so you land on 0 or a positive count.",
        ],
      },
    ],
    chart: `flowchart TD
  from["Start at the smaller number"] --> ten["Hop up to 10 and keep that hop"]
  ten --> rest["Hop from 10 to the bigger number"]
  rest --> diff["Add the hops. That is the difference"]`,
    walk: {
      problem: "15 − 9",
      steps: [
        "Start at 9. The hop to 10 is 1.",
        "The hop from 10 to 15 is 5.",
        "1 + 5 = 6.",
        "15 − 9 = 6.",
      ],
    },
    practice: { drill: "subtraction" },
  },
  {
    n: 9,
    slug: "split-the-number",
    short: "Split",
    title: "Split the number",
    blurb: "Break the bigger number into tens and ones. Multiply each piece, then add.",
    icon: Split,
    diagram: "split",
    sections: [
      {
        heading: "Tens, then ones",
        paragraphs: [
          "A product like 83 × 7 is two small products. Split 83 into 80 and 3. Multiply each part by 7, then add those results.",
          "80 × 7 is 8 × 7 with a zero on the end, so 560. 3 × 7 is 21. 560 + 21 is 581. The same split works for any number from 10 to 99 times a single digit.",
        ],
      },
    ],
    chart: `flowchart LR
  see["83 times 7"] --> tens["80 times 7 is 560"]
  see --> ones["3 times 7 is 21"]
  tens --> add["Add the two products"]
  ones --> add
  add --> product["581"]`,
    walk: {
      problem: "83 × 7",
      steps: [
        "Split 83 into 80 and 3.",
        "80 × 7 = 560.",
        "3 × 7 = 21.",
        "560 + 21 = 581.",
      ],
    },
    practice: { drill: "fast" },
  },
  {
    n: 10,
    slug: "ones-then-carry",
    short: "Carry",
    title: "Ones first, then the carry",
    blurb: "Multiply the ones, keep the last digit, and add the carry to the tens product.",
    icon: ArrowDownToLine,
    diagram: "carry",
    sections: [
      {
        heading: "Vertically, one column at a time",
        paragraphs: [
          "Once the split feels slow, do the same work from the ones place. 3 × 7 is 21. The ones digit of the answer is 1, and the 2 is a carry.",
          "Then 8 × 7 is 56. Add the carry: 56 + 2 is 58. Put 58 in front of the 1. The product is 581. This is the vertically-and-crosswise move for a two-digit number times one digit.",
        ],
      },
    ],
    chart: `flowchart TD
  ones["3 times 7 is 21"] --> write["Write 1. Carry 2"]
  write --> tens["8 times 7 is 56"]
  tens --> plus["56 plus the carry 2 is 58"]
  plus --> product["581"]`,
    walk: {
      problem: "83 × 7",
      steps: [
        "3 × 7 = 21. Write 1 and carry 2.",
        "8 × 7 = 56.",
        "56 + 2 = 58.",
        "83 × 7 = 581.",
      ],
    },
    practice: { drill: "fast", table: 7 },
  },
  {
    n: 11,
    slug: "times-eleven",
    short: "Times 11",
    title: "Times eleven",
    blurb: "The outside digits stay. The middle digit is their sum, with a carry when that sum is 10 or more.",
    icon: Rows3,
    diagram: "times-eleven",
    sections: [
      {
        heading: "The middle is the sum",
        paragraphs: [
          "For a two-digit number times 11, the first and last digits stay where they are, and the middle is their sum. 42 × 11 is 4, then 4 + 2, then 2, so 462.",
          "When the sum is 10 or more, carry 1 into the left digit. 83 × 11 starts as 8, 11, 3. The 11 gives a middle digit of 1 and a carry of 1, so the 8 becomes 9. The product is 913.",
        ],
      },
    ],
    chart: `flowchart LR
  ends["Keep 8 and 3 on the ends"] --> middle["Middle is 8 plus 3, which is 11"]
  middle --> carry["Carry 1 into the 8"]
  carry --> product["913"]`,
    walk: {
      problem: "83 × 11",
      steps: [
        "The ends stay 8 and 3.",
        "The middle is 8 + 3 = 11.",
        "Write the middle as 1 and carry 1 onto the 8, which becomes 9.",
        "83 × 11 = 913.",
      ],
    },
    practice: { drill: "fast", table: 11 },
  },
  {
    n: 12,
    slug: "squares-ending-in-five",
    short: "End in 5",
    title: "Squares that end in 5",
    blurb: "For a number ending in 5, multiply the front digit by one more than itself, then write 25.",
    icon: Square,
    diagram: "end-in-five",
    sections: [
      {
        heading: "One more than the one before",
        paragraphs: [
          "A square that ends in 5 always ends in 25. The front of the answer is the front digit times one more than itself. For 35 × 35, the front digit is 3, and one more is 4. 3 × 4 is 12, so the square is 1225.",
          "75 × 75 uses the same move: 7 × 8 is 56, and the ending is 25, so 5625. The drill that follows is still two-digit times one digit. Use this page when the number you are squaring ends in 5.",
        ],
      },
    ],
    chart: `flowchart LR
  front["Front digit is 3"] --> more["One more than 3 is 4"]
  more --> product["3 times 4 is 12"]
  product --> ending["Write 25 on the end"]
  ending --> square["1225"]`,
    walk: {
      problem: "35 × 35",
      steps: [
        "The number ends in 5, so the square ends in 25.",
        "The front digit is 3. One more than 3 is 4.",
        "3 × 4 = 12.",
        "35 × 35 = 1225.",
      ],
    },
    practice: { drill: "fast" },
  },
];

export function mathTrickBySlug(slug: string) {
  return mathTricks.find((trick) => trick.slug === slug) ?? null;
}

export function mathNeighbors(slug: string) {
  const index = mathTricks.findIndex((trick) => trick.slug === slug);
  if (index < 0) return { prev: null, next: null };
  return {
    prev: index > 0 ? mathTricks[index - 1] : null,
    next: index < mathTricks.length - 1 ? mathTricks[index + 1] : null,
  };
}

export function practiceHref(trick: MathTrick) {
  const params = new URLSearchParams({ drill: trick.practice.drill });
  if (trick.practice.table) params.set("table", String(trick.practice.table));
  return `/math/practice?${params.toString()}`;
}
