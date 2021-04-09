import React from "react";
import * as d3 from "d3";

import { VariableSizeGrid as List } from "react-window";
import { head } from "lodash";

import LineChart from "./LineChart";

import "./App.css";

const start = 1616397701 * 1000;
const end = 1617875266 * 1000;

export const getTicks = (scaleFactor = 30) => {
  const scaleFactorInSeconds = scaleFactor * 60;
  const tickSize = Math.round(scaleFactorInSeconds / 500);

  const range = d3.scaleUtc().domain([start, end]);
  const ticks = range.ticks(
    scaleFactor > 60
      ? d3.utcHour.every(scaleFactor / 60)
      : d3.utcMinute.every(scaleFactor)
  );

  return {
    scaleFactorInSeconds,
    ticks,
    tickSize,
    scaleFactor,
  };
};

const listRef = React.createRef();
class ScrollComponent extends React.Component {
  state = {
    ticks: [],
  };

  componentDidMount() {
    const { ticks } = getTicks();

    this.setState(
      {
        ticks,
      },
      () => {
        listRef.current.scrollToItem({
          rowIndex: ticks.length,
        });
      }
    );
  }

  render() {
    return (
      <React.Fragment>
        <List
          columnCount={2}
          columnWidth={() => 300}
          rowHeight={() => 500}
          height={500}
          ref={listRef}
          rowCount={this.state.ticks.length}
          itemData={this.state.ticks}
          layout="vertical"
          className="scroll-container"
          width={window.innerWidth}
        >
          {LineChart}
        </List>
      </React.Fragment>
    );
  }
}

function App() {
  return (
    <React.Fragment>
      <ScrollComponent />
    </React.Fragment>
  );
}

export default App;
