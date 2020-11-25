let data;
let aggregatedDataByTime;
let aggregatedDataByRentedStation;
let aggregatedDataByReturnedStation;
let aggregatedDataForDetailedView;
let stationNumbers;
let inflowByHour;
let outflowByHour;
const aggregateTimePerSeconds = 900; // 15분 단위로 모음
let lineChartXDomain;
let selected_property = "rented";

/* 
  startTime, endTime: 선택된 시간 구간
  1970년 1월 1일 이후의 밀리 초 수로 저장됨 (integer)
  Date.parse로 대여일시, 반납일시 parse

  aggregatedDataForMap: 각 대여소별로 선택된 시간 범위 내에서 
  rent된 자전거 대수와 return된 자전거 대수 저장
  대여소 번호를 key로 가지고, value는 rented와 returned를 저장한 object

  aggregatedDataForMap = {
    "10000": {
      rented: 100,
      returned: 102
    },
    "10002": {
      rented: 201,
      returned: 188
    }, 
    ...
  }

  brushing으로 선택 시간 갱신할 때마다 
  aggregatedDataForMap, startTime, endTime 자동 갱신
*/
//let aggregatedDataForMap;
let startTime, endTime;

const lineChartWidth = 1400;
const lineChartHeight = 150;
const flowChartWidth = 800;
const flowChartHeight = 500;
const margin = 40;

const brush = d3
  .brushX()
  .extent([
    [0, 0],
    [lineChartWidth, lineChartHeight],
  ])
  .on("end", brushed);

const lineChart = d3
  .select("#linechart")
  .attr("width", lineChartWidth + margin * 2)
  .attr("height", lineChartHeight + margin * 2)
  .append("svg")
  .attr("width", lineChartWidth + margin * 2)
  .attr("height", lineChartHeight + margin * 2)
  .append("g")
  .attr("transform", `translate(${margin}, ${margin})`);

let lineChartTooltip = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

var clip = lineChart
  .append("defs")
  .append("svg:clipPath")
  .attr("id", "clip")
  .append("svg:rect")
  .attr("width", lineChartWidth)
  .attr("height", lineChartHeight)
  .attr("x", 0)
  .attr("y", 0);

let lineChartX, lineChartY;

const flowChart = d3
  .select("#flowchart")
  .attr("width", flowChartWidth)
  .attr("height", flowChartHeight)
  .append("svg")
  .attr("width", flowChartWidth)
  .attr("height", flowChartHeight)
  .append("g")
  .attr("transform", `translate(${margin}, ${margin})`);

let flowChartX, flowChartY;

main();

async function main() {
  data = await d3.csv("data.csv");
  initAggregatedData();
  initLineChartAxes();
  initLineChart();
}

function initAggregatedData() {
  /* 
    aggregatedDataByTime = 
    [
        [
            10000000111,
            {
                "rented": 1022,
                "returned": 1033,
                "stationData": {
                    "01111": {
                        rented: 10,
                        returned: 21,
                    },
                    "01121": {
                        rented: 22,
                        returned: 21,
                    },
                    ...
                }
            }
        ],
        ...
    ]
  */
  aggregatedDataByTime = {};
  data.forEach((d) => {
    let rentedTime =
      parseInt(Date.parse(d["대여일시"]) / (aggregateTimePerSeconds * 1000)) *
      (aggregateTimePerSeconds * 1000);
    let returnedTime =
      parseInt(Date.parse(d["반납일시"]) / (aggregateTimePerSeconds * 1000)) *
      (aggregateTimePerSeconds * 1000);
    if (isNaN(rentedTime) || isNaN(returnedTime)) return;

    if (!aggregatedDataByTime.hasOwnProperty(rentedTime)) {
      aggregatedDataByTime[rentedTime] = {
        rented: 0,
        returned: 0,
        stationData: {},
      };
    }
    if (
      !aggregatedDataByTime[rentedTime].stationData.hasOwnProperty(
        Number(d["대여 대여소번호"])
      )
    ) {
      aggregatedDataByTime[rentedTime].stationData[
        Number(d["대여 대여소번호"])
      ] = {
        rented: 0,
        returned: 0,
        total: 0,
      };
    }
    aggregatedDataByTime[rentedTime].rented++;
    aggregatedDataByTime[rentedTime].stationData[Number(d["대여 대여소번호"])]
      .rented++;
    aggregatedDataByTime[rentedTime].stationData[Number(d["대여 대여소번호"])]
      .total--;

    if (!aggregatedDataByTime.hasOwnProperty(returnedTime)) {
      aggregatedDataByTime[returnedTime] = {
        rented: 0,
        returned: 0,
        stationData: {},
      };
    }
    if (
      !aggregatedDataByTime[returnedTime].stationData.hasOwnProperty(
        Number(d["반납대여소번호"])
      )
    ) {
      aggregatedDataByTime[returnedTime].stationData[
        Number(d["반납대여소번호"])
      ] = {
        rented: 0,
        returned: 0,
        total: 0,
      };
    }
    aggregatedDataByTime[returnedTime].returned++;
    aggregatedDataByTime[returnedTime].stationData[Number(d["반납대여소번호"])]
      .returned++;
    aggregatedDataByTime[returnedTime].stationData[Number(d["반납대여소번호"])]
      .total++;
  });
  aggregatedDataByTime = Object.entries(aggregatedDataByTime).sort(
    (a, b) => a[0] - b[0]
  );
  lineChartXDomain = d3.extent(aggregatedDataByTime, (d) => d[0]);
  [startTime, endTime] = lineChartXDomain;
  aggregateDataForMap();
}

async function aggregateDataForMap() {
  aggregatedDataForMap = {};

  aggregatedDataByTime
    .filter((v) => v[0] >= startTime && v[0] <= endTime)
    .forEach((v) => {
      for (const [stationNum, info] of Object.entries(v[1].stationData)) {
        if (!aggregatedDataForMap.hasOwnProperty(stationNum))
          aggregatedDataForMap[stationNum] = { rented: 0, returned: 0 };
        aggregatedDataForMap[stationNum].rented += info.rented;
        aggregatedDataForMap[stationNum].returned += info.returned;
      }
    });
  updateMap("linechart");
  //console.log(aggregatedDataForMap);
}

function aggregateDataForDetailedView() {
  aggregatedDataForDetailedView = aggregatedDataByTime.filter(
    (v) => v[0] >= startTime && v[0] <= endTime
  );
}

function initLineChartAxes() {
  lineChartX = d3
    .scaleTime()
    .domain(lineChartXDomain)
    .range([0, lineChartWidth]);

  lineChartY = d3
    .scaleLinear()
    .domain(d3.extent(aggregatedDataByTime, (d) => d[1][selected_property]))
    .range([lineChartHeight, 0]);
}

function initLineChart() {
  lineChart
    .append("g")
    .attr("id", "linechart_x")
    .attr("transform", `translate(0, ${lineChartHeight})`)
    .call(d3.axisBottom(lineChartX));

  lineChart.append("g").attr("id", "linechart_y").call(d3.axisLeft(lineChartY));
  lineChart
    .append("g")
    .attr("width", lineChartWidth)
    .attr("height", lineChartHeight)
    .attr("id", "linechart_data")
    .attr("clip-path", "url(#clip)")
    .selectAll("path")
    .data([aggregatedDataByTime])
    .enter()
    .append("path")
    .attr("fill", "none")
    .attr("stroke", "#808080")
    .attr("d", (data) =>
      d3
        .line()
        .x((d) => lineChartX(+d[0]))
        .y((d) => lineChartY(d[1][selected_property]))(data)
    );
  lineChart
    .on("dblclick", (event) => {
      [startTime, endTime] = lineChartXDomain;
      lineChartX.domain(lineChartXDomain);
      lineChart
        .select("#linechart_x")
        .transition()
        .duration(1000)
        .call(d3.axisBottom(lineChartX));
      lineChart
        .select("#linechart_data")
        .select("path")
        .transition()
        .duration(1000)
        .attr(
          "d",
          d3
            .line()
            .x((d) => lineChartX(+d[0]))
            .y((d) => lineChartY(d[1][selected_property]))(aggregatedDataByTime)
        );
      aggregateDataForMap();
    })
    .on("mouseover", function (event, d) {
      let pageX = event.pageX;
      let pageY = event.pageY;
      lineChartTooltip.transition().style("opacity", 0.9);
      lineChartTooltip
        .html(d3.timeFormat("%x %X")(lineChartX.invert(pageX)))
        .style("left", pageX + "px")
        .style("top", pageY - 28 + "px");
    })
    .on("mouseout", (d) => {
      lineChartTooltip.transition().duration(200).style("opacity", 0);
    });

  lineChart.append("g").attr("class", "brush").call(brush);
}

function brushed({ selection }) {
  if (!selection) return;
  [startTime, endTime] = selection.map((v) => Date.parse(lineChartX.invert(v)));

  lineChartX.domain([startTime, endTime]);
  lineChart.select(".brush").call(brush.move, null);

  lineChart
    .select("#linechart_x")
    .transition()
    .duration(1000)
    .call(d3.axisBottom(lineChartX));
  lineChart
    .select("#linechart_data")
    .select("path")
    .transition()
    .duration(1000)
    .attr(
      "d",
      d3
        .line()
        .x((d) => lineChartX(+d[0]))
        .y((d) => lineChartY(d[1][selected_property]))(aggregatedDataByTime)
    );
  aggregateDataForMap();
}
