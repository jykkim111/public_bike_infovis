const lineBarChartWidth = 800;
const lineBarChartHeight = 500;

const lineBarChart = d3
  .select("#linebarchart")
  .append("svg")
  .attr("width", lineBarChartWidth + margin * 2)
  .attr("height", lineBarChartHeight + margin * 2)
  .append("g")
  .attr("transform", `translate(${margin}, ${margin / 2})`);

let lineBarChartX, lineBarChartY;
const lineBarChartXAxes = lineBarChart
  .append("g")
  .attr("id", "linebarchart_x")
  .attr("transform", `translate(0, ${lineBarChartHeight / 2})`);
const lineBarChartYAxes = lineBarChart.append("g").attr("id", "linebarchart_y");
const lineBarChartData = lineBarChart
  .append("g")
  .attr("width", lineBarChartWidth)
  .attr("height", lineBarChartHeight)
  .attr("id", "linebarchart_data");

let _startTime, _endTime;

function updateLineBarChartAxes() {
  let ymax = Math.max(
    d3.max(aggregatedDataForDetailedView, (d) =>
      d.values.reduce(
        (p, c) =>
          p +
          (c[1].stationData[selectedStationNum]
            ? c[1].stationData[selectedStationNum].rented
            : 0),
        0
      )
    ),
    d3.max(aggregatedDataForDetailedView, (d) =>
      d.values.reduce(
        (p, c) =>
          p +
          (c[1].stationData[selectedStationNum]
            ? c[1].stationData[selectedStationNum].returned
            : 0),
        0
      )
    )
  );

  lineBarChartX = d3
    .scaleTime()
    .domain([_startTime, _endTime])
    .range([0, lineBarChartWidth]);

  lineBarChartY = d3
    .scaleLinear()
    .domain([-ymax, ymax])
    .range([lineBarChartHeight, 0]);

  lineBarChartRectY = d3
    .scaleLinear()
    .domain([0, ymax])
    .range([0, lineBarChartHeight / 2]);
}

const lineColor = {
  rented: "red",
  returned: "blue",
  total: "#808080",
};

function updateLineBarChart() {
  if (selectedStationNum === undefined) return;
  aggregateDataForDetailedView();

  [_startTime, _endTime] = d3.extent(
    aggregatedDataForDetailedView,
    (d) => +d.key
  );
  _endTime += aggregateTimePerMilliseconds_detailedview;

  updateLineBarChartAxes(selectedStationNum);
  lineBarChartXAxes.call(d3.axisBottom(lineBarChartX));

  lineBarChartYAxes.call(d3.axisLeft(lineBarChartY));

  lineBarChartData.selectAll("path").remove();

  lineBarChartData
    .selectAll("path")
    .data(["rented", "returned"])
    .enter()
    .append("path")
    .attr("fill", "none")
    .attr("stroke", (type) => lineColor[type])
    .attr("d", (type) =>
      d3
        .line()
        .x((i) => {
          let d = aggregatedDataForDetailedView[parseInt(i / 3)];
          if (!d) return lineBarChartX(_endTime);
          return (
            lineBarChartX(+d.key) +
            (i % 3 === 2
              ? (lineBarChartWidth *
                  aggregateTimePerMilliseconds_detailedview) /
                (_endTime - _startTime)
              : 0)
          );
        })
        .y((i) => {
          let d;
          if (i % 3 === 0) {
            return lineBarChartY(0);
          } else d = aggregatedDataForDetailedView[parseInt(i / 3)];
          return lineBarChartY(
            (type === "rented" ? -1 : 1) *
              d.values.reduce(
                (p, c) =>
                  p +
                  (c[1].stationData[selectedStationNum]
                    ? c[1].stationData[selectedStationNum][type]
                    : 0),
                0
              )
            /*
            d.value.stationData[selectedStationNum]
              ? (type === "rented" ? -1 : 1) *
                  d.value.stationData[selectedStationNum][type]
              : 0
            */
          );
        })(d3.range(0, aggregatedDataForDetailedView.length * 3 + 1))
    )
    .style("opacity", 0.5);

  lineBarChartData.selectAll("rect").remove();
  lineBarChartData
    .selectAll("rect")
    .data(aggregatedDataForDetailedView)
    .enter()
    .append("rect")
    .attr("x", (d) => lineBarChartX(+d.key))
    .attr("y", (d) => {
      if (
        d.values.reduce(
          (p, c) =>
            p +
            (c[1].stationData[selectedStationNum]
              ? c[1].stationData[selectedStationNum].total
              : 0),
          0
        ) > 0
      )
        return (
          lineBarChartY(0) -
          lineBarChartRectY(
            Math.abs(
              d.values.reduce(
                (p, c) =>
                  p +
                  (c[1].stationData[selectedStationNum]
                    ? c[1].stationData[selectedStationNum].total
                    : 0),
                0
              )
            )
          )
        );
      return lineBarChartY(0);
    })
    .attr(
      "width",
      (lineBarChartWidth * aggregateTimePerMilliseconds_detailedview) /
        (_endTime - _startTime)
    )
    .attr("height", (d) =>
      lineBarChartRectY(
        Math.abs(
          d.values.reduce(
            (p, c) =>
              p +
              (c[1].stationData[selectedStationNum]
                ? c[1].stationData[selectedStationNum].total
                : 0),
            0
          )
        )
      )
    )
    .style("stroke", (d) =>
      d.values.reduce(
        (p, c) =>
          p +
          (c[1].stationData[selectedStationNum]
            ? c[1].stationData[selectedStationNum].total
            : 0),
        0
      ) > 0
        ? "RoyalBlue"
        : "Tomato"
    )
    .style("fill", (d) =>
      d.values.reduce(
        (p, c) =>
          p +
          (c[1].stationData[selectedStationNum]
            ? c[1].stationData[selectedStationNum].total
            : 0),
        0
      ) > 0
        ? "blue"
        : "red"
    )
    .style("opacity", 0.5);
}

/*
d.value = [
  []
]
*/
