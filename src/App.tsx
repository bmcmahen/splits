import { useCallback, useReducer } from "react";
import "./App.css";
import { defaultTemplate, getCombinedMinSizes } from "./Grid/get-sizes";
import { Grid, reducer } from "./Grid/Grid";
import "./Grid/css-grid";

function App() {
  const renderContent = useCallback(() => {
    return <div style={{ color: "#888" }} className="content"></div>;
  }, []);

  const [state, dispatch] = useReducer(reducer, defaultTemplate);

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
      <Grid
        template={state.a}
        dispatch={dispatch}
        rootTemplate={state}
        renderContent={renderContent}
      />
    </div>
  );
}

export default App;
