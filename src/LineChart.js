import React from "react";
import "./App.css";

import * as d3 from "d3";
import { withFauxDOM } from "react-faux-dom";
import { head, find, flatten, filter } from "lodash";
import { getTicks } from "./App";
import {
  indicators as indicatorsStatic,
  visibleIndicators,
} from "./indicatorHelpers";

class LineChart extends React.Component {
  state = {
    indicators: [],
    height: 0,
  };

  async componentDidMount() {
    const { rowIndex, data } = this.props;
    const tick = data[rowIndex];

    const { scaleFactorInSeconds } = getTicks();

    const min = tick;
    const max = new Date(tick.getTime() + scaleFactorInSeconds * 1000);

    const response = await fetch(
      "http://buroptima.tetacom.pro/ru-RU/api/v1/buroptima/indicatorValuesByTime/getInterpolated",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wellId: 13,
          indicatorIds: flatten(visibleIndicators),
          from: min.toISOString(),
          to: max.toISOString(),
          tickSize: getTicks().tickSize * 200,
        }),
      }
    );
    const json = await response.json();

    this.setState(
      {
        indicators: json,
      },
      () => {
        this.update();
      }
    );
  }

  update() {
    const { columnIndex, rowIndex, data, connectFauxDOM } = this.props;
    const { scaleFactorInSeconds } = getTicks();

    const height = 500;
    const faux = connectFauxDOM("g", "chart");
    const svg = d3.select(faux);

    const tick = data[rowIndex];
    const min = tick.getTime();
    const max = tick.getTime() + scaleFactorInSeconds * 1000;

    const offsetX = 110;

    const y = d3
      .scaleUtc()
      .domain([new Date(min), new Date(max)])
      .range([0, height])
      .clamp(true);

    if (columnIndex === 0) {
      svg
        .append("g")
        .attr("class", "yaxis")
        .attr("transform", `translate(${offsetX},0)`)
        .call(
          d3.axisLeft(y).ticks(10).tickFormat(d3.utcFormat("%d-%m-%Y %H:%M"))
        )
        .call((g) => g.select(".tick").remove());
    }

    const colors = d3
      .scaleSequential()
      .domain([columnIndex, this.state.indicators.length])
      .interpolator(d3.interpolateRainbow);

    const self = this;

    const grid = svg
      .append("g")
      .attr("transform", `translate(${offsetX}, 10)`)
      .attr("class", "grid");

    const gridY = svg
      .append("g")
      .attr("transform", `translate(${offsetX + 200},0)`)
      .attr("class", "gridY");

    const gridlines = d3
      .axisBottom(d3.scaleLinear([0, 7], [0, 200]))
      .ticks(7)
      .tickFormat("")
      .tickSize(height);

    const gridlinesY = d3.axisLeft(y).ticks(10).tickFormat("").tickSize(200);

    grid.call(gridlines);
    gridY.call(gridlinesY);

    svg.select(".grid path").remove();
    svg.select(".gridY path").remove();
    svg.select(".gridY .tick:first-child").remove();

    const filtered = filter(this.state.indicators, (indicator) => {
      if (columnIndex === 0) {
        return (
          indicator.indicatorId === 2 ||
          indicator.indicatorId === 5 ||
          indicator.indicatorId === 4
        );
      }
      return indicator.indicatorId === 12 || indicator.indicatorId === 13;
    });

    const markers = svg.selectAll(".cursor-data-marker").data(filtered || []);

    d3.selectAll("#tooltip").remove();

    markers
      .enter()
      .append("circle")
      .attr("class", "cursor-data-marker")
      .attr("pointer-events", "none")
      .attr("r", 6)
      .attr("transform", `translate(${offsetX}, 10)`)
      .attr("fill", (_, i) => colors(i))
      .style("display", "none");

    const overlay = svg
      .append("rect")
      .style("fill", "none")
      .style("pointer-events", "all")
      .attr("width", 500)
      .attr("height", 500);

    svg.on("mouseout", () => {
      svg.selectAll(".cursor-data-marker").style("display", "none");
      svg.selectAll(".cursor-data").style("display", "none");
      d3.selectAll("#tooltip").style("display", "none");

      self.props.drawFauxDOM();
    });

    markers
      .enter()
      .append("text")
      .attr("class", "cursor-data")
      .attr("dominant-baseline", "hanging")
      .attr("text-rendering", "optimizeLegibility")
      .attr("stroke", "none")
      .attr("font-size", "12")
      .attr("font-weight", "bold")
      .attr("fill", (d, i) => {
        return colors(i);
      });

    overlay.on("mouseover", () => {
      svg.selectAll(".cursor-data-marker").style("display", null);
      svg.selectAll(".cursor-data").style("display", null);
      d3.selectAll("#tooltip").style("display", null);
      self.props.drawFauxDOM();
    });

    overlay.on("mousemove", function (event) {
      const bisect = d3.bisector((d) => d.y * 1000).right;
      const y0 = y.invert(event.layerY);

      svg.selectAll(".cursor-data-marker").attr("transform", (indicator) => {
        const indicatorOptions = find(indicatorsStatic, {
          id: indicator.indicatorId,
        });

        const x = d3
          .scaleLinear()
          .domain(indicatorOptions.domain)
          .range([0, 200])
          .clamp(true);

        const points = indicator.values.reduce((acc, current) => {
          acc.push({ x: current.x1, y: current.y });

          if (current.x1 !== current.x2) {
            acc.push({ x: current.x2, y: current.y });
          }
          return acc;
        }, []);

        const linePoints = [...points];

        if (indicator.nextBatchFirstValue && indicator.nextBatchFirstValue) {
          linePoints.push({
            x: indicator.nextBatchFirstValue.x,
            y: indicator.nextBatchFirstValue.y,
          });
        }

        const index = bisect(linePoints, y0, 1);
        const data = linePoints[index] || [];

        return `translate(${x(data.x) + offsetX}, ${y(data.y * 1000)})`;
      });

      svg
        .selectAll(".cursor-data")
        .attr("transform", (indicator) => {
          const indicatorOptions = find(indicatorsStatic, {
            id: indicator.indicatorId,
          });

          const x = d3
            .scaleLinear()
            .domain(indicatorOptions.domain)
            .range([0, 200])
            .clamp(true);

          const points = indicator.values.reduce((acc, current) => {
            acc.push({ x: current.x1, y: current.y });

            if (current.x1 !== current.x2) {
              acc.push({ x: current.x2, y: current.y });
            }
            return acc;
          }, []);

          const linePoints = [...points];

          if (indicator.nextBatchFirstValue && indicator.nextBatchFirstValue) {
            linePoints.push({
              x: indicator.nextBatchFirstValue.x,
              y: indicator.nextBatchFirstValue.y,
            });
          }

          const index = bisect(linePoints, y0, 1);
          const data = linePoints[index] || [];

          return `translate(${offsetX}, ${y(data.y * 1000)})`;
        })
        .html((indicator, idx) => {
          const indicatorOptions = find(indicatorsStatic, {
            id: indicator.indicatorId,
          });

          const x = d3
            .scaleLinear()
            .domain(indicatorOptions.domain)
            .range([0, 200])
            .clamp(true);

          const points = indicator.values.reduce((acc, current) => {
            acc.push({ x: current.x1, y: current.y });

            if (current.x1 !== current.x2) {
              acc.push({ x: current.x2, y: current.y });
            }
            return acc;
          }, []);

          const linePoints = [...points];

          if (indicator.nextBatchFirstValue && indicator.nextBatchFirstValue) {
            linePoints.push({
              x: indicator.nextBatchFirstValue.x,
              y: indicator.nextBatchFirstValue.y,
            });
          }

          const index = bisect(linePoints, y0, 1);
          const data = linePoints[index] || [];
          const format = d3.utcFormat("%d-%m-%Y %H:%M:%S");
          return (
            <tspan x={5} y={indicatorOptions.id * 5}>
              {data.x} / {format(data.y * 1000)}
            </tspan>
          );
        });

      self.props.drawFauxDOM();
    });

    filtered.map((indicator, index) => {
      const points = indicator.values.reduce((acc, current) => {
        acc.push({ x: current.x1, y: current.y });

        if (current.x1 !== current.x2) {
          acc.push({ x: current.x2, y: current.y });
        }
        return acc;
      }, []);

      const linePoints = [...points];

      if (indicator.nextBatchFirstValue && indicator.nextBatchFirstValue) {
        linePoints.push({
          x: indicator.nextBatchFirstValue.x,
          y: indicator.nextBatchFirstValue.y,
        });
      }

      const indicatorOptions = find(indicatorsStatic, {
        id: indicator.indicatorId,
      });

      const x = d3
        .scaleLinear()
        .domain(indicatorOptions.domain)
        .range([0, 200])
        .clamp(true);

      let d = d3
        .line()
        .curve(d3.curveBasis)
        .x(function (d) {
          return x(d.x);
        })
        .y(function (d) {
          return y(d.y * 1000);
        });

      svg
        .append("path")
        .attr("class", "line")
        .attr("transform", `translate(${offsetX}, 0)`)
        .attr("fill", "none")
        .attr("stroke", colors(index))
        .attr("stroke-width", 2)
        .datum(linePoints)
        .attr("d", d);
    });
  }

  render() {
    const { columnIndex, rowIndex, style } = this.props;

    return (
      <div style={style}>
        <svg height={510} width={window.innerWidth}>
          {this.props.chart}
        </svg>
      </div>
    );
  }
}

export default withFauxDOM(LineChart);
