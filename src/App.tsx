import { useCallback, useReducer } from "react";
import "./App.css";
import { defaultTemplate, getCombinedMinSizes } from "./Grid/get-sizes";
import { Grid, reducer } from "./Grid/Grid";
import "./Grid/css-grid";
import { CssGrid, renderTemplate } from "./Grid/css-grid";

function App() {
  console.log(renderTemplate);
  return (
    <div
      style={{
        overflow: "hidden",
        display: "flex",
        width: "100vw",
        height: "100vh",
        padding: "8px",
      }}
    >
      <CssGrid template={renderTemplate} />
    </div>
  );
}

export default App;
