const lineBarChartWidth = 800;
const lineBarChartHeight = 400;

const lineBarChart = d3
  .select("#linebarchart")
  .append("svg")
  .attr("width", lineBarChartWidth + margin * 2)
  .attr("height", lineBarChartHeight + margin * 2)
  .append("g")
  .attr("transform", `translate(${margin}, ${margin})`);

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
function updateLineBarChartAxes() {
  let ymax = Math.max(
    d3.max(aggregatedDataForDetailedView, (d) =>
      d[1].stationData[selectedStationNum]
        ? d[1].stationData[selectedStationNum].rented
        : 0
    ),
    d3.max(aggregatedDataForDetailedView, (d) =>
      d[1].stationData[selectedStationNum]
        ? d[1].stationData[selectedStationNum].returned
        : 0
    )
  );
  lineBarChartX = d3
    .scaleTime()
    .domain([startTime, endTime])
    .range([0, lineBarChartWidth]);
  lineBarChartY = d3
    .scaleLinear()
    .domain([-ymax, ymax])
    .range([lineBarChartHeight, 0]);
}

const lineColor = {
  rented: "red",
  returned: "blue",
  total: "#808080",
};

function updateLineBarChart() {
  if (selectedStationNum === undefined) return;
  aggregateDataForDetailedView();
  updateLineBarChartAxes(selectedStationNum);
  lineBarChartXAxes.call(d3.axisBottom(lineBarChartX));

  lineBarChartYAxes.call(d3.axisLeft(lineBarChartY));

  lineBarChartData.selectAll("path").remove();

  lineBarChartData
    .selectAll("path")
    .data(["rented", "returned", "total"])
    .enter()
    .append("path")
    .attr("fill", "none")
    .attr("stroke", (type) => lineColor[type])
    .attr("d", (type) =>
      d3
        .line()
        .x((d) => lineBarChartX(+d[0]))
        .y((d) =>
          lineBarChartY(
            d[1].stationData[selectedStationNum]
              ? (type === "rented" ? -1 : 1) *
                  d[1].stationData[selectedStationNum][type]
              : 0
          )
        )(aggregatedDataForDetailedView)
    );
}
