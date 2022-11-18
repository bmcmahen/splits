const template = {
  rows: [100],
  cols: [100],
  areas: {
    a: {
      colStart: 1,
      colEnd: 1,
      rowStart: 1,
      rowEnd: 1,
    },
  },
};

type Template = {
  rows: number[];
  cols: number[];
  areas: {
    [key: string]: {
      colStart: number;
      colEnd: number;
      rowStart: number;
      rowEnd: number;
    };
  };
};

export function splitRow(area: string, areaToAdd: string, template: Template) {
  const areaToSplit = template.areas[area];
  const rowToAddTo = areaToSplit.rowEnd;

  const newArea = {
    colStart: areaToSplit.colStart,
    colEnd: areaToSplit.colEnd,
    rowStart: areaToSplit.rowEnd + 1,
    rowEnd: areaToSplit.rowEnd + 1,
  };

  // for each area, if the colStart is greater than the colToAddTo, increment it by 1
  // if the colEnd is greater than the colToAddTo, increment it by 1
  Object.keys(template.areas).forEach((key) => {
    if (area === key) return;
    const thisArea = template.areas[key];
    if (thisArea.rowEnd === rowToAddTo) {
      thisArea.rowEnd = thisArea.rowEnd + 1;
    }
  });

  template.rows = [
    ...template.rows.slice(0, rowToAddTo),
    100,
    ...template.rows.slice(rowToAddTo),
  ];

  template.areas[areaToAdd] = newArea;

  return template;
}

export function splitCol(area: string, areaToAdd: string, template: Template) {
  const areaToSplit = template.areas[area];
  const colToAddTo = areaToSplit.colEnd;

  const newArea = {
    colStart: areaToSplit.colEnd + 1,
    colEnd: areaToSplit.colEnd + 1,
    rowStart: areaToSplit.rowStart,
    rowEnd: areaToSplit.rowEnd,
  };

  // for each area, if the colStart is greater than the colToAddTo, increment it by 1
  // if the colEnd is greater than the colToAddTo, increment it by 1
  Object.keys(template.areas).forEach((key) => {
    if (area === key) return;
    const thisArea = template.areas[key];
    if (thisArea.colEnd === colToAddTo) {
      thisArea.colEnd = thisArea.colEnd + 1;
    }
  });

  template.cols = [
    ...template.cols.slice(0, colToAddTo),
    100,
    ...template.cols.slice(colToAddTo),
  ];

  template.areas[areaToAdd] = newArea;

  return template;
}

export const renderTemplate = splitRow(
  "d",
  "e",
  splitCol("c", "d", splitRow("b", "c", splitRow("a", "b", template)))
);

export function CssGrid({ template }: { template: Template }) {
  const gridTemplateRows = template.rows.map((row) => `${row}px`).join(" ");
  const gridTemplateColumns = template.cols.map((col) => `${col}px`).join(" ");

  return (
    <div
      style={{
        gap: "8px",
        display: "grid",
        gridTemplateRows,
        gridTemplateColumns,
      }}
    >
      {Object.keys(template.areas).map((area) => {
        const { colStart, colEnd, rowStart, rowEnd } = template.areas[area];
        return (
          <div
            key={area}
            style={{
              gridColumnStart: colStart,
              gridColumnEnd: colEnd + 1,
              gridRowStart: rowStart,
              gridRowEnd: rowEnd + 1,
              background: "red",
            }}
          >
            {area}
          </div>
        );
      })}
    </div>
  );
}
