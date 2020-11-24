let data;
let aggregatedDataByTime;
let aggregatedDataByRentedStation;
let aggregatedDataByReturnedStation;
let inflowByHour;
let outflowByHour;
let aggregateTimePerSeconds = 600; // 10분 단위로 모음
let lineChartXDomain;

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
    lineChartXDomain = d3.extent(data, (d) => Date.parse(d["대여일시"]));
    [startTime, endTime] = lineChartXDomain;
    initAggregatedData();
    initLineChartAxes();
    initLineChart();
}

function initAggregatedData() {
    aggregatedDataByTime = d3
        .nest()
        .key(
            (d) =>
            parseInt(
                Date.parse(d["대여일시"]) / (aggregateTimePerSeconds * 1000)
            ) *
            (aggregateTimePerSeconds * 1000)
        )
        .sortKeys(d3.ascending)
        .rollup((v) => v.length)
        .entries(data);

    aggregatedDataByRentedStation = d3
        .nest()
        .key((d) => d["대여 대여소번호"])
        .rollup((v) => v.map((d) => Date.parse(d["대여일시"])))
        .entries(data);

    aggregatedDataByReturnedStation = d3
        .nest()
        .key((d) => d["반납대여소번호"])
        .rollup((v) => v.map((d) => Date.parse(d["반납일시"])))
        .entries(data);

    aggregatedDataForMap = {};
    aggregatedDataByReturnedStation.forEach((v) => {
        aggregatedDataForMap[Number(v.key)] = {
            rented: 0,
            returned: 0,
        };
    });
    aggregatedDataByRentedStation.forEach((v) => {
        aggregatedDataForMap[Number(v.key)] = {
            rented: 0,
            returned: 0,
        };
    });
}

function aggregateDataForMap() {
    aggregatedDataByRentedStation.forEach((v) => {
        aggregatedDataForMap[Number(v.key)].rented = v.value.filter(
            (date) => date >= startTime && date <= endTime
        ).length;
    });
    aggregatedDataByReturnedStation.forEach((v) => {
        aggregatedDataForMap[Number(v.key)].returned = v.value.filter(
            (date) => date >= startTime && date <= endTime
        ).length;
    });
}

function initLineChartAxes() {
    lineChartX = d3
        .scaleTime()
        .domain(lineChartXDomain)
        .range([0, lineChartWidth]);

    lineChartY = d3
        .scaleLinear()
        .domain(d3.extent(aggregatedDataByTime, (d) => +d.value))
        .range([lineChartHeight, 0]);
}

function initLineChart() {
    lineChart
        .append("g")
        .attr("id", "linechart_x")
        .attr("transform", `translate(0, ${lineChartHeight})`)
        .call(d3.axisBottom(lineChartX));

    lineChart
        .append("g")
        .attr("id", "linechart_y")
        .call(d3.axisLeft(lineChartY));

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
            .x((d) => lineChartX(+d.key))
            .y((d) => lineChartY(+d.value))(data)
        );
    lineChart
        .on("dblclick", (event) => {
            [startTime, endTime] = lineChartXDomain;
            aggregateDataForMap();
            updateMap('linechart');
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
                    .x((d) => lineChartX(+d.key))
                    .y((d) => lineChartY(+d.value))(aggregatedDataByTime)
                );
        })
        .on("mouseover", function(event, d) {
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
    [startTime, endTime] = selection.map((v) =>
        Date.parse(lineChartX.invert(v))
    );

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
            .x((d) => lineChartX(+d.key))
            .y((d) => lineChartY(+d.value))(aggregatedDataByTime)
        );
    aggregateDataForMap();
    updateMap('linechart');
}