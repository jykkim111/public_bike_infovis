async function setMap(rent_data, region, view) {
  //=========================
  // Draw Map
  // input:
  //      선택된 자치구, 기간에 해당하는 data
  //      json station_data: [{"대여소 번호", "보관소(대여소)명", "자치구", "위도", "경도", "대여량"} , {} ...]
  //      string region
  //      int view (0: rent, 1: return, 2: rent&return)
  //=========================
  //console.log(rent_data);

  let gangnam_bike_stations = [];
  let total_rent = 0,
    total_return = 0;
  let max_rent = 0,
    max_return = 0;

  for (let i = 0; i < station_data.length; i++) {
    if (region == "전체" || station_data[i]["자치구"] == region) {
      station_data[i]["rented"] = 10;
      station_data[i]["returned"] = 10;

      if (rent_data != undefined) {
        if (rent_data[station_data[i]["대여소번호"]] != undefined) {
          station_data[i]["rented"] =
            rent_data[station_data[i]["대여소번호"]].rented;
          station_data[i]["returned"] =
            rent_data[station_data[i]["대여소번호"]].returned;
        }
      }

      if (max_rent < station_data[i]["rented"]) {
        max_rent = station_data[i]["rented"];
      }

      if (max_return < station_data[i]["returned"]) {
        max_return = station_data[i]["returned"];
      }

      total_rent += station_data[i]["rented"];
      total_return += station_data[i]["returned"];

      gangnam_bike_stations.push(station_data[i]);
    }
  }
  let max_rent_radius = (100 / max_rent) * total_rent;
  let max_return_radius = (100 / max_return) * total_return;

  gangnam_bike_stations.forEach(function (d) {
    let circle_radius;
    let circle_color;
    if (view == 0) {
      //rent
      circle_radius = (d["rented"] / total_rent) * max_rent_radius;
      circle_color = "red";
    } else if (view == 1) {
      //return
      circle_radius = (d["returned"] / total_return) * max_return_radius;
      circle_color = "blue";
    } else if (view == 2) {
      //rent&return
      if (d["rented"] >= d["returned"]) {
        circle_radius = (d["rented"] / total_rent) * max_rent_radius;
        circle_color = "red";
      } else {
        circle_radius = (d["returned"] / total_return) * max_return_radius;
        circle_color = "blue";
      }
    }

    let circle = L.circle([d["위도"], d["경도"]], {
      color: circle_color,
      fillColor: circle_color,
      weight: 0,
      fillOpacity: 0.8,
      radius: circle_radius,
      className: "value",
      id: d["대여소번호"].toString(),
    })
      .bindTooltip("[" + d["대여소번호"] + "] " + d["보관소(대여소)명"], {
        permanent: false,
        direction: "right",
      })
      .addTo(mymap)
      .on("mouseover", (event) => {
        event.target.setStyle({
          weight: 3,
        });
      })
      .on("mouseout", (event) => {
        event.target.setStyle({
          weight: 0,
        });
      })
      .on("mouseup", (event) => {
        if (event.target.options.color == "green") {
          event.target.setStyle({
            color: circle_color,
            fillColor: circle_color,
            weight: 0,
          });
        } else {
          let station_num = event.target.options.id;
          // TODO: 선택한 station_num 에 해당하는 chart 지도 밑에 생성
          initLineBarChart(station_num);
          event.target.setStyle({
            color: "green",
            fillColor: "green",
            weight: 3,
          });
        }
      });
  });
}

function updateMode(mode) {
  if (mode == "normal") {
    mymap.eachLayer(function (layer) {
      let station_num = layer.options.id;

      if (station_num == undefined || station_num == "") {
        return;
      } else {
        layer.setStyle({
          color: "red",
          fillColor: "red",
          fillOpacity: 0.8,
        });
      }
    });
  }

  if (mode == "flow") {
    let updated_color = "#f03";

    mymap.eachLayer(function (layer) {
      let station_num = layer.options.id;
      //console.log(station_num);

      if (station_num == undefined || station_num == "") {
        return;
      } else {
        let numLength = station_num.length;
        if (numLength != 5) {
          let zeros = 5 - numLength;
          for (let i = 0; i < zeros; i++) {
            station_num = "0".concat(station_num);
          }
        }
        let rented = 0;
        let returned = 0;
        if (aggregatedDataForMap[station_num] == undefined) {
          return;
        } else {
          rented = aggregatedDataForMap[station_num].rented;
          returned = aggregatedDataForMap[station_num].returned;
        }

        let color_code = returned / rented;

        if (color_code < 1) {
          updated_color = "red";
        } else if (color_code > 1.2) {
          updated_color = "blue";
        } else {
          updated_color = "green";
        }
      }

      layer.setStyle({
        color: updated_color,
        fillColor: updated_color,
        weight: 0,
        fillOpacity: 0.8,
      });
    });
  }
}

let station_data;
let mymap;
let regions = [
  "전체",
  "종로구",
  "중구",
  "용산구",
  "성동구",
  "광진구",
  "동대문구",
  "중랑구",
  "성북구",
  "강북구",
  "도봉구",
  "노원구",
  "은평구",
  "서대문구",
  "마포구",
  "양천구",
  "강서구",
  "구로구",
  "금천구",
  "영등포구",
  "동작구",
  "관악구",
  "서초구",
  "강남구",
  "송파구",
  "강동구",
];

main();

async function main() {
  station_data = await d3.csv("spot_data.csv");
  //console.log(station_data);

  mymap = L.map("map").setView([37.48, 127.05], 13);

  L.tileLayer(
    "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiamtzbW9vdmUxNCIsImEiOiJja2hqNzk2ODkwajBxMnNzZDRicjUzeDVnIn0.W6JG8IbwREpA3HRD0T8-7g",
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: "mapbox/streets-v11",
      tileSize: 512,
      zoomOffset: -1,
      accessToken: "your.mapbox.access.token",
    }
  ).addTo(mymap);

  // setting map_region
  let opt = document.querySelector("#map_region");
  regions.forEach(function (d) {
    let temp = document.createElement("option");
    temp.text = d;
    temp.value = d;
    opt.add(temp);
  });

  // TODO: sync 오류 해결
  setMap(aggregatedDataForMap, "전체", 0);
}

function updateMap(option) {
  // TODO: 선택한 지역에 따라서 지도 Viewing 위치 변경
  let mr = document.querySelector("#map_region");
  let region = mr.options[mr.selectedIndex].value;
  let mm = document.querySelector("#map_mode");
  let mode = mm.options[mm.selectedIndex].value;
  let mv = document.querySelector("#map_view");
  let view = mv.options[mv.selectedIndex].value;

  mymap.eachLayer(function (layer) {
    if (layer.options.className == "value") mymap.removeLayer(layer);
  });

  if (mode == "normal") {
    setMap(aggregatedDataForMap, region, view);
  } else if (mode == "flow") {
    updateMode(mode);
  }
}
