const lineBarChartWidth = 600;
const lineBarChartHeight = 500;

const lineBarChart = d3
  .select("#linebarchart")
  .append("svg")
  .attr("width", lineBarChartWidth + margin * 2)
  .attr("height", lineBarChartHeight + margin * 1.5)
  .append("g")
  .attr("transform", `translate(${margin * 1.2}, ${margin / 2})`);

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
  .attr("id", "linebarchart");

lineBarChartData.append("g").attr("id", "linebarchart_rented");

lineBarChartData.append("g").attr("id", "linebarchart_returned");

lineBarChartData.append("g").attr("id", "linebarchart_total");

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
    .domain([startTime_detailedview, endTime_detailedview])
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

function getStationData() {
  const selectedStation = station_data.filter(
    (v) => v["대여소번호"] === selectedStationNum
  )[0];
  let rented = 0,
    returned = 0;
  aggregatedDataForDetailedView.forEach((d) => {
    rented += d.values.reduce(
      (p, c) =>
        p +
        (c[1].stationData[selectedStationNum]
          ? c[1].stationData[selectedStationNum].rented
          : 0),
      0
    );
    returned += d.values.reduce(
      (p, c) =>
        p +
        (c[1].stationData[selectedStationNum]
          ? c[1].stationData[selectedStationNum].returned
          : 0),
      0
    );
  });
  let timeUnit;
  if (aggregateTimePerMilliseconds_detailedview == millisecondsPerDay)
    timeUnit = "1일";
  else if (aggregateTimePerMilliseconds_detailedview > millisecondsPerHour)
    timeUnit = `${
      aggregateTimePerMilliseconds_detailedview / millisecondsPerHour
    }시간`;
  else
    timeUnit = `${
      (aggregateTimePerMilliseconds_detailedview / millisecondsPerHour) * 60
    }분`;
  return {
    name: selectedStation["보관소(대여소)명"],
    address: selectedStation["상세주소"],
    rented,
    returned,
    total: returned - rented,
    timeUnit,
  };
}

function updateLineBarChart() {
  if (selectedStationNum === undefined) return;
  aggregateDataForDetailedView();
  ReactDOM.render(e(StationInfo), document.querySelector("#StationInfo"));

  updateLineBarChartAxes(selectedStationNum);
  lineBarChartXAxes.call(d3.axisBottom(lineBarChartX));

  lineBarChartYAxes.call(d3.axisLeft(lineBarChartY));

  const lineBarChartData_total = lineBarChartData.select("#linebarchart_total");
  lineBarChartData_total.selectAll("rect").remove();
  lineBarChartData_total
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
        (endTime_detailedview - startTime_detailedview)
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
    .style("opacity", 0.35);

  for (let type of ["rented", "returned"]) {
    lineBarChartData.select(`#linebarchart_${type}`).selectAll("rect").remove();
    lineBarChartData
      .select(`#linebarchart_${type}`)
      .selectAll("rect")
      .data(aggregatedDataForDetailedView)
      .enter()
      .append("rect")
      .attr("x", (d) => lineBarChartX(+d.key))
      .attr("y", (d) => {
        if (type === "returned")
          return (
            lineBarChartY(0) -
            lineBarChartRectY(
              d.values.reduce(
                (p, c) =>
                  p +
                  (c[1].stationData[selectedStationNum]
                    ? c[1].stationData[selectedStationNum][type]
                    : 0),
                0
              )
            )
          );
        return lineBarChartY(0);
      })
      .attr(
        "width",
        (lineBarChartWidth * aggregateTimePerMilliseconds_detailedview) /
          (endTime_detailedview - startTime_detailedview)
      )
      .attr("height", (d) =>
        lineBarChartRectY(
          d.values.reduce(
            (p, c) =>
              p +
              (c[1].stationData[selectedStationNum]
                ? c[1].stationData[selectedStationNum][type]
                : 0),
            0
          )
        )
      )
      .style("stroke", type === "returned" ? "RoyalBlue" : "Tomato")
      .style("fill", type === "returned" ? "blue" : "red")
      .style("opacity", 0.2);
  }
}
