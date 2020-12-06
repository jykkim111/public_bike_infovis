let data;
let aggregatedDataByTime;
let weatherData;
let aggregatedWeatherData;
let aggregatedDataByRentedStation;
let aggregatedDataByReturnedStation;
let aggregatedDataForDetailedView;
let stationNumbers;
let inflowByHour;
let outflowByHour;
const aggregateTimePerMilliseconds = 1000 * 900; // 15분 단위로 모음
const aggregateTimePerMilliseconds_weather = 1000 * 3600;
let aggregateTimePerMilliseconds_detailedview = aggregateTimePerMilliseconds;
let lineChartXDomain;
let selected_property = "rented";
let switchState = false;
let defaultColor = "#ffffff";
const millisecondsPerDay = 1000 * 24 * 60 * 60;
const millisecondsPerHour = 1000 * 60 * 60;
let selectedTimeInterval = [0, 24 * millisecondsPerHour];

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
//let startTime, endTime;

const lineChartWidth = 1730;
const lineChartHeight = 200;
const flowChartWidth = 800;
const flowChartHeight = 500;
const margin = 40;
const defaultLineColor = "#808080";

const brush = d3
  .brushX()
  .extent([
    [0, 0],
    [lineChartWidth, lineChartHeight],
  ])
  .on("start brush end", brushed);

const lineChart = d3
  .select("#linechart")
  .append("svg")
  .attr("width", lineChartWidth + margin * 2)
  .attr("height", lineChartHeight + margin * 1.5)
  .append("g")
  .attr("transform", `translate(${margin}, ${margin / 2})`);

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

const components = d3
  .select("#components")
  .append("Button")
  .attr("variant", "contained")
  .attr("color", "primary")
  .attr("width", 30)
  .attr("height", 50)
  .text("hi");
let flowChartX, flowChartY;

main();

async function main() {
  //data = await d3.csv("data.csv");
  aggregatedDataByTime = await d3.json("data.json");
  weatherData = await d3.csv("weather.csv");
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
  /*
  aggregatedDataByTime = {};
  data.forEach((d) => {
    let rentedTime =
      parseInt(Date.parse(d["대여일시"]) / aggregateTimePerMilliseconds) *
      aggregateTimePerMilliseconds;
    let returnedTime =
      parseInt(Date.parse(d["반납일시"]) / aggregateTimePerMilliseconds) *
      aggregateTimePerMilliseconds;
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
  */
  lineChartXDomain = [
    Date.parse("2020-05-01 00:00"),
    Date.parse("2020-05-31 23:59"),
  ];
  [startTime, endTime] = lineChartXDomain;
  onSelectedTimeChanged();

  aggregatedWeatherData = d3
    .nest()
    .key(
      (d) =>
        parseInt(Date.parse(d["일시"]) / aggregateTimePerMilliseconds_weather) *
        aggregateTimePerMilliseconds_weather
    )
    .sortKeys(d3.ascending)
    .rollup((v) => ({
      humidity: +v[v.length - 1]["습도"],
      precipitation: +v[v.length - 1]["누적강수량"],
    }))
    .entries(weatherData);

  let prevPrecipitation = 0;
  for (let i = 1; i < aggregatedWeatherData.length; i++) {
    let t = aggregatedWeatherData[i].key;
    if (t % millisecondsPerDay == 0) {
      prevPrecipitation = 0;
    }
    let curPrecipitation = aggregatedWeatherData[i].value.precipitation;
    aggregatedWeatherData[i].value.precipitation -= prevPrecipitation;
    prevPrecipitation = curPrecipitation;
  }
}

function onSliderChanged(interval) {
  selectedTimeInterval = interval;
  d3.select("#rects")
    .selectAll("rect")
    .data(aggregatedWeatherData, (d) => d.key)
    .style("stroke", (d) => grayGradient(d.key, d.value.precipitation))
    .style("fill", (d) => grayGradient(d.key, d.value.precipitation));
}

function onSliderChangeCommitted(interval) {
  selectedTimeInterval = interval;
  onSelectedTimeChanged();
}

function sliderModeChange(state) {
  defaultColor = state ? "#fdf06f" : "#ffffff";
  d3.select("#rects")
    .selectAll("rect")
    .data(aggregatedWeatherData, (d) => d.key)
    .transition()
    .duration(1000)
    .style("stroke", (d) => grayGradient(d.key, d.value.precipitation))
    .style("fill", (d) => grayGradient(d.key, d.value.precipitation));
  onSelectedTimeChanged();
}

async function onSelectedTimeChanged() {
  aggregateDataForMap();
  updateMap("linechart");
  updateLineBarChart();
  ReactDOM.render(
    e(DateAndTimePickers),
    document.querySelector("#DateAndTimePickers")
  );
}

function onSwitchChanged(state) {
  switchState = state;
  d3.select("#rects")
    .selectAll("rect")
    .data(aggregatedWeatherData, (d) => d.key)
    .transition()
    .duration(600)
    .style("stroke", (d) => grayGradient(d.key, d.value.precipitation))
    .style("fill", (d) => grayGradient(d.key, d.value.precipitation));
}

function grayGradient(key, val) {
  let color = defaultColor;
  if (
    !(
      (key - 15 * millisecondsPerHour) % millisecondsPerDay >=
        selectedTimeInterval[0] &&
      (key - 15 * millisecondsPerHour) % millisecondsPerDay <
        selectedTimeInterval[1]
    )
  )
    color = "#ffffff";
  if (!switchState || val == 0) return color;
  else if (val <= 5) return d3.rgb(color).darker(1);
  else if (val <= 10) return d3.rgb(color).darker(2);
  else return d3.rgb(color).darker(3);
}

function aggregateDataForMap() {
  aggregatedDataForMap = {};

  aggregatedDataByTime
    .filter(
      (v) =>
        v[0] >= startTime &&
        v[0] <= endTime &&
        (defaultColor === "#ffffff" ||
          ((v[0] - 15 * millisecondsPerHour) % millisecondsPerDay >=
            selectedTimeInterval[0] &&
            (v[0] - 15 * millisecondsPerHour) % millisecondsPerDay <=
              selectedTimeInterval[1]))
    )
    .forEach((v) => {
      for (const [stationNum, info] of Object.entries(v[1].stationData)) {
        if (!aggregatedDataForMap.hasOwnProperty(stationNum))
          aggregatedDataForMap[stationNum] = { rented: 0, returned: 0 };
        aggregatedDataForMap[stationNum].rented += info.rented;
        aggregatedDataForMap[stationNum].returned += info.returned;
      }
    });
  //console.log(aggregatedDataForMap);
}

function aggregateDataForDetailedView(aggregateTimePerMilliseconds_custom) {
  let totalTime = endTime - startTime;
  if (aggregateTimePerMilliseconds_custom)
    aggregateTimePerMilliseconds_detailedview = aggregateTimePerMilliseconds_custom;
  else {
    if (totalTime > millisecondsPerDay * 15)
      aggregateTimePerMilliseconds_detailedview = millisecondsPerHour * 24;
    else if (totalTime > millisecondsPerDay * 7)
      aggregateTimePerMilliseconds_detailedview = millisecondsPerHour * 12;
    else if (totalTime > millisecondsPerDay * 4)
      aggregateTimePerMilliseconds_detailedview = millisecondsPerHour * 6;
    else if (totalTime > millisecondsPerDay * 2)
      aggregateTimePerMilliseconds_detailedview = millisecondsPerHour * 3;
    else if (totalTime > millisecondsPerDay / 2)
      aggregateTimePerMilliseconds_detailedview = millisecondsPerHour * 1;
    else if (totalTime > millisecondsPerDay / 4)
      aggregateTimePerMilliseconds_detailedview = millisecondsPerHour * 0.5;
    else aggregateTimePerMilliseconds_detailedview = millisecondsPerHour * 0.25;
  }

  startTime_detailedview =
    parseInt(
      (startTime - 15 * millisecondsPerHour) /
        aggregateTimePerMilliseconds_detailedview
    ) *
      aggregateTimePerMilliseconds_detailedview +
    15 * millisecondsPerHour;
  endTime_detailedview =
    parseInt(
      (endTime - 15 * millisecondsPerHour) /
        aggregateTimePerMilliseconds_detailedview
    ) *
      aggregateTimePerMilliseconds_detailedview +
    15 * millisecondsPerHour +
    aggregateTimePerMilliseconds_detailedview;
  aggregatedDataForDetailedView = d3
    .nest()
    .key(
      (v) =>
        parseInt(
          (v[0] - 15 * millisecondsPerHour) /
            aggregateTimePerMilliseconds_detailedview
        ) *
          aggregateTimePerMilliseconds_detailedview +
        15 * millisecondsPerHour
    )
    .entries(
      aggregatedDataByTime.filter(
        (v) => v[0] >= startTime_detailedview && v[0] < endTime_detailedview
      )
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
    .attr("id", "rects")
    .attr("clip-path", "url(#clip)")
    .selectAll("rect")
    .data(aggregatedWeatherData, (d) => d.key)
    .enter()
    .append("rect")
    .attr("x", (d) => lineChartX(d.key))
    .attr(
      "width",
      (lineChartWidth * aggregateTimePerMilliseconds_weather) /
        (endTime - startTime)
    )
    .attr("height", lineChartHeight)
    .style("stroke", (d) => grayGradient(d.key, d.value.precipitation))
    .style("fill", (d) => grayGradient(d.key, d.value.precipitation));

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
    .attr("stroke", defaultLineColor)
    .attr("d", (data) =>
      d3
        .line()
        .x((d) => lineChartX(+d[0]))
        .y((d) => lineChartY(d[1][selected_property]))(data)
    );
  lineChart.on("dblclick", (event) => {
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
    lineChart
      .select("#rects")
      .selectAll("rect")
      .data(aggregatedWeatherData, (d) => d.key)
      .transition()
      .duration(1000)
      .attr("x", (d) => lineChartX(d.key))
      .attr(
        "width",
        (lineChartWidth * aggregateTimePerMilliseconds_weather) /
          (endTime - startTime)
      )
      .attr("height", lineChartHeight)
      .style("stroke", (d) => grayGradient(d.key, d.value.precipitation))
      .style("fill", (d) => grayGradient(d.key, d.value.precipitation));
    onSelectedTimeChanged();
  });

  lineChart.append("g").attr("class", "brush").call(brush);
}

function brushed({ selection, type }) {
  if (!selection) return;
  [startTime, endTime] = selection.map((v) => Date.parse(lineChartX.invert(v)));
  if (type === "brush") {
    ReactDOM.render(
      e(DateAndTimePickers),
      document.querySelector("#DateAndTimePickers")
    );
  } else if (type === "end") {
    lineChartX.domain([startTime, endTime]);
    lineChart.select(".brush").call(brush.move, null);

    lineChart
      .select("#rects")
      .selectAll("rect")
      .data(aggregatedWeatherData, (d) => d.key)
      .transition()
      .duration(1000)
      .attr("x", (d) => lineChartX(d.key))
      .attr(
        "width",
        (lineChartWidth * aggregateTimePerMilliseconds_weather) /
          (endTime - startTime)
      )
      .attr("height", lineChartHeight)
      .style("stroke", (d) => grayGradient(d.key, d.value.precipitation))
      .style("fill", (d) => grayGradient(d.key, d.value.precipitation));

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
    onSelectedTimeChanged();
  }
}
