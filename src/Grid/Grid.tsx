import "./Grid.css";
import { useGesture } from "@use-gesture/react";
import { useMemo, useRef, useState } from "react";
import { getCombinedMinSizes, getNextGridSizesDuringPan } from "./get-sizes";

type Content = {
  size: number;
  id: string;
};

type Split = {
  id: string;
  size: number;
  direction: "vertical" | "horizontal";
  items: Array<string>;
};

export type Template = Record<string, Content | Split>;

export const defaultTemplate: Template = {
  root: {
    id: "root",
    direction: "vertical",
    size: 1000,
    items: ["a", "b"],
  },
  third: {
    id: "third",
    size: 500,
  },
  a: {
    id: "a",
    size: 500,
    direction: "horizontal",
    items: ["c", "d", "third"],
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
    items: ["e", "f"],
    direction: "vertical",
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

type Actions =
  | {
      name: "RESIZE";
      payload: {
        snapshot: Array<number>;
        parentId: string;
        resizeId: string;
        pan: number;
      };
    }
  | {
      name: "ADD_COLUMN";
      payload: {
        parentId?: string;
        targetId: number;
        before?: boolean;
      };
    }
  | {
      name: "ADD_ROW";
      payload: {
        parentId: string;
        index: number;
      };
    }
  | {
      name: "REMOVE";
      payload: {
        parentId: string;
        index: number;
      };
    };

export function reducer(state: Template, action: Actions) {
  switch (action.name) {
    case "ADD_COLUMN": {
      const { parentId, before, targetId } = action.payload;
      const parent = state[parentId];

      // is the parent already split into columns? then we just add a new column
      if (parent && parent.direction && parent.direction === "horizontal") {
        const newId = Math.random().toString(36).substr(2, 9);

        // get size of new column, defaulting to col being equal sized
        const nextSize =
          document.getElementById(parentId)?.getBoundingClientRect().width /
          (parent.items.length + 1);

        const newContent: Content = {
          id: newId,
          size: nextSize,
        };

        // remove some size from each existing child. todo: account for min sizes
        parent.items.forEach((id) => {
          const { width } = document
            .getElementById(id)
            ?.getBoundingClientRect();
          const nextWidth = width - width / (parent.items.length + 1);
          state[id].size = nextWidth;
        });

        const newItems = [...parent.items];
        const targetIndex = newItems.indexOf(targetId.toString());
        if (before) {
          newItems.splice(targetIndex, 0, newId);
        } else {
          newItems.splice(targetIndex + 1, 0, newId);
        }
        return {
          ...state,
          [newId]: newContent,
          [parentId]: {
            ...parent,
            items: newItems,
          },
        };
      }

      const newId = Math.random().toString(36).substr(2, 9);
      const subChildId = Math.random().toString(36).substr(2, 9);

      return {
        ...state,
        [targetId]: {
          ...state[targetId],
          direction: "horizontal",
          items: [newId, subChildId],
        },
        [newId]: {
          id: newId,
          size: 500,
        },
        [subChildId]: {
          ...state[targetId],
          id: subChildId,
          size: 500,
        },
      };

      // is there no parent?

      return state;
    }

    case "ADD_ROW": {
      const { parentId, before, targetId } = action.payload;
      const parent = state[parentId];

      // is the parent already split into columns? then we just add a new column
      if (parent && parent.direction && parent.direction === "vertical") {
        const newId = Math.random().toString(36).substr(2, 9);

        // get size of new column, defaulting to col being equal sized
        const nextSize =
          document.getElementById(parentId)?.getBoundingClientRect().width /
          (parent.items.length + 1);

        const newContent: Content = {
          id: newId,
          size: nextSize,
        };

        // remove some size from each existing child. todo: account for min sizes
        parent.items.forEach((id) => {
          const { height } = document
            .getElementById(id)
            ?.getBoundingClientRect();
          const nextheight = height - height / (parent.items.length + 1);
          state[id].size = nextheight;
        });

        const newItems = [...parent.items];
        const targetIndex = newItems.indexOf(targetId.toString());
        if (before) {
          newItems.splice(targetIndex, 0, newId);
        } else {
          newItems.splice(targetIndex + 1, 0, newId);
        }
        return {
          ...state,
          [newId]: newContent,
          [parentId]: {
            ...parent,
            items: newItems,
          },
        };
      }

      const newId = Math.random().toString(36).substr(2, 9);
      const subChildId = Math.random().toString(36).substr(2, 9);

      return {
        ...state,
        [targetId]: {
          ...state[targetId],
          direction: "vertical",
          items: [newId, subChildId],
        },
        [newId]: {
          id: newId,
          size: 500,
        },
        [subChildId]: {
          ...state[targetId],
          id: subChildId,
          size: 500,
        },
      };

      // is there no parent?

      return state;
    }

    case "RESIZE": {
      const { pan, resizeId, snapshot, parentId } = action.payload;
      const parent = state[parentId];

      // this function needs to traverse the tree to find
      // the combined min-height / min-width of all the children
      // so that it's smallest size is not smaller than the sum of all the children
      // not sure how this would work during window resizing unfortunately

      const currentIndex = parent.items.indexOf(resizeId);
      const { nextDimensions } = getNextGridSizesDuringPan(
        currentIndex,
        pan,
        snapshot
      );

      let nextState = {
        ...state,
      };

      nextDimensions.forEach((size, index) => {
        const id = parent.items[index];
        nextState[id] = {
          ...state[id],
          size,
        };
      });

      return nextState;
    }
  }
  return state;
}

type Props = {
  template: Content | Split;
};

export function Grid({
  renderContent = () => {},
  onDrag = () => {},
  onDragStart = () => {},
  template,
  rootTemplate,
  dispatch,
  parentId,
}: Props) {
  const ref = useRef(null);

  const cache = useRef();

  const { direction } = template;

  const cacheWidths = () => {
    const children = Array.from(ref.current.children).filter((child) => {
      return child.className.includes("grid-item");
    });

    const sizes = [];
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const { width, height } = child.getBoundingClientRect();
      sizes.push(direction === "vertical" ? height : width);
    }
    console.log("sizes", sizes);
    cache.current = sizes;
  };

  const handleDrag = ([x, y], id) => {
    dispatch({
      name: "RESIZE",
      payload: {
        snapshot: cache.current,
        parentId: template.id,
        resizeId: id,
        pan: direction === "vertical" ? y : x,
      },
    });
  };

  // pass these onto parent, so that the parent can calc the start
  // dimensions of the children via measurement, and then
  // dispatch state updates from there.
  const bind = useGesture({
    onDrag: ({ movement }) => {
      const [x, y] = movement;
      onDrag([x, y], template.id);
    },
    onDragStart: () => {
      onDragStart();
    },
  });

  const shouldRender = template.items && template.id;

  const content = useMemo(() => {
    if (shouldRender) {
      return renderContent();
    }

    return null;
  }, [template.id, shouldRender]);

  const [minY, minX] = getCombinedMinSizes(template.id, rootTemplate);

  const gapY = (minY - 1) * 8;
  const gapX = (minX - 1) * 8;

  return (
    <div
      id={template.id}
      ref={ref}
      style={{
        position: "relative",
        flexBasis: `${template.size}px`,
        flexGrow: 1,
        flexShrink: 1,
        background: !template.items ? "#eee" : "none",
        minWidth: minX * 80 + gapX + "px",
        minHeight: minY * 80 + gapY + "px",
        ...(template.items && {
          display: "flex",
          gap: "8px",
          flexDirection: template.direction === "vertical" ? "column" : "row",
        }),
      }}
      data-direction={template.direction}
      className="grid-item"
    >
      {template.items ? (
        <>
          {template.items.map((id) => {
            return (
              <Grid
                dispatch={dispatch}
                renderContent={renderContent}
                key={id}
                parentId={template.id}
                template={rootTemplate[id]}
                rootTemplate={rootTemplate}
                onDrag={handleDrag}
                onDragStart={cacheWidths}
              />
            );
          })}
        </>
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
          }}
        >
          {template.id}
          <button
            onClick={(e) => {
              e.stopPropagation();

              dispatch({
                name: "ADD_COLUMN",
                payload: {
                  parentId: parentId,
                  targetId: template.id,
                  before: true,
                },
              });
            }}
          >
            col before
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();

              dispatch({
                name: "ADD_COLUMN",
                payload: {
                  parentId: parentId,
                  targetId: template.id,
                  before: false,
                },
              });
            }}
          >
            col after
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();

              dispatch({
                name: "ADD_ROW",
                payload: {
                  parentId: parentId,
                  targetId: template.id,
                  before: true,
                },
              });
            }}
          >
            row before
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();

              dispatch({
                name: "ADD_ROW",
                payload: {
                  parentId: parentId,
                  targetId: template.id,
                  before: false,
                },
              });
            }}
          >
            row after
          </button>
        </div>
      )}
      <button data-divider onClick={(e) => e.stopPropagation()} {...bind()} />
    </div>
  );
}
