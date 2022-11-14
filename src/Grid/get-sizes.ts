import { Template, defaultTemplate } from "./Grid";

export function getCombinedMinSizes(
  id: string,
  template: Template,
  dimensionsY = 0,
  dimensionsX = 0,
  directionContext = new Set()
) {
  const { direction, items } = template[id];

  if (direction) {
    if (direction === "vertical") {
      dimensionsY += items.length;
    } else {
      dimensionsX += items.length;
    }

    directionContext.add(direction);

    items.forEach((item) => {
      if (template[item].items) {
        const dir = template[item].direction;
        if (directionContext.has(dir) && dir === "vertical") {
          dimensionsY -= 1;
        } else if (directionContext.has(dir) && dir === "horizontal") {
          dimensionsX -= 1;
        }

        const [y, x] = getCombinedMinSizes(
          item,
          template,
          0,
          0,
          directionContext
        );

        dimensionsY += y;
        dimensionsX += x;
      }
    });
  } else {
    return [1, 1];
  }

  return [dimensionsY, dimensionsX];
}

export const defaultTemplate: Template = {
  root: {
    id: "root",

    size: 1000,
  },
  a: {
    id: "a",
    size: 500,
  },
  b: {
    id: "b",
    size: 500,
  },
  c: {
    id: "c",
    size: 500,
  },
  d: {
    id: "d",
    size: 500,
  },
  e: {
    id: "e",
    size: 500,
  },
  f: {
    id: "f",
    size: 500,
  },
};

export function getNextGridSizesDuringPan(
  currentIndex: number,
  panProp: number,
  snapshot: Array<number>,
  minSize = 80
) {
  const pan = panProp;
  let remainder = Math.abs(pan);

  // Panning up / left
  if (pan < 0) {
    let nextDimensions = [];

    const expandingPanelIndex = currentIndex + 1;

    for (let index = snapshot.length - 1; index >= 0; index -= 1) {
      if (index >= expandingPanelIndex) {
        nextDimensions[index] = snapshot[index];
        continue;
      }

      let prevSize = snapshot[index] - remainder;

      if (prevSize <= minSize) {
        prevSize = minSize;
      }

      const diffSize = snapshot[index] - prevSize;
      remainder -= diffSize;
      nextDimensions[index] = prevSize;
    }

    const nextSize = snapshot[expandingPanelIndex] - pan - remainder;

    nextDimensions[expandingPanelIndex] = nextSize;

    return {
      nextDimensions,
      remainder,
    };
  }

  // Panning down / right
  // Note: the assumption is that the minimum index
  // for currentIndex here is actually 1 because
  // resizers are at the top of the element, and therefore
  // not visible in the first row.
  if (pan > 0) {
    let nextDimensions = [];

    let prevExpandedIndex = currentIndex;

    for (let index = 0; index <= snapshot.length - 1; index += 1) {
      const panel = snapshot[index];

      if (index <= prevExpandedIndex) {
        nextDimensions[index] = panel;
        continue;
      }

      let nextSize = snapshot[index] - remainder;

      if (nextSize <= minSize) {
        nextSize = minSize;
      }

      const diffHeight = snapshot[index] - nextSize;
      remainder -= diffHeight;
      nextDimensions[index] = nextSize;
    }

    const nextSize = snapshot[prevExpandedIndex] + pan - remainder;

    nextDimensions[prevExpandedIndex] = nextSize;

    return {
      nextDimensions,
      remainder,
    };
  }

  return {
    nextDimensions: [...snapshot],
    remainder: 0,
  };
}
