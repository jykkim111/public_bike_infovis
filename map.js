async function setMap(rent_data, region, view) {
    //=========================
    // Draw Map
    // input:
    //      선택된 자치구, 기간에 해당하는 data
    //      json station_data: [{"대여소 번호", "보관소(대여소)명", "자치구", "위도", "경도", "대여량"} , {} ...]
    //      string region
    //      int view (0: 총 이용량, 1: in & out)
    //=========================
    //console.log(rent_data);

    let gangnam_bike_stations = [];

    let max_rent = 0,
        max_return = 0;
    let min_rent = 99999,
        min_return = 9999;
    let max_diff = 0;
    let min_diff = 99999;

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

            if (min_rent > station_data[i]["rented"]) {
                min_rent = station_data[i]["rented"];
            }

            if (min_return > station_data[i]["returned"]) {
                min_return = station_data[i]["returned"];
            }

            let temp_diff = Math.abs(station_data[i]["rented"] - station_data[i]["returned"]);
            if (min_diff > temp_diff) {
                min_diff = temp_diff;
            }

            if (max_diff < temp_diff) {
                max_diff = temp_diff;
            }

            gangnam_bike_stations.push(station_data[i]);
        }
    }

    console.log("min/max rent: ", min_rent, max_rent);
    console.log("min/max returned: ", min_return, max_return);
    console.log("min/max diff: ", min_diff, max_diff);

    let total_max = Math.max(max_rent, max_return);
    let total_min = Math.min(min_rent, min_return);
    let radius_interval = 20;// 20~120

    if(view == 0){
        setSlider(1, 0, max_diff);
    }
    else if(view == 1){
        setSlider(0, total_min, total_max);
    }


    gangnam_bike_stations.forEach(function(d) {
        let circle_radius;
        let circle_color;
        let temp_val;

        if (view == 0) {
            temp_val = d["rented"] - d["returned"];

            if (temp_val >= 0) {
                circle_color = pickHex(slider_color[0], slider_color[1], Math.abs(temp_val) / max_diff);
            } else {
                circle_color = pickHex(slider_color[2], slider_color[1], Math.abs(temp_val) / max_diff);
                //circle_color = "blue";
            }
            console.log("color: ", Math.abs(temp_val) / max_diff)

            circle_radius = ((Math.abs(temp_val) - min_diff) / Math.max(2, (max_diff - min_diff) / 100) + 1) * radius_interval;
        } 
        else if (view == 1){
            if (d["rented"] >= d["returned"]) {
                temp_val = d["rented"];
                circle_color = pickHex(slider_1_color[1], slider_1_color[0], Math.abs(temp_val) / total_max);
                //circle_color = "red";
            } else {
                temp_val = d["returned"];
                circle_color = pickHex(slider_2_color[1], slider_2_color[0], Math.abs(temp_val) / total_max);
            }
            circle_radius = ((temp_val - total_min) / Math.max(2, (total_max - total_min) / 100) + 1) * radius_interval
        }
        let circle = L.circle([d["위도"], d["경도"]], {
                color: d3.rgb(circle_color[0], circle_color[1], circle_color[2]),
                fillColor: d3.rgb(circle_color[0], circle_color[1], circle_color[2]),
                weight: 0,
                fillOpacity: 0.8,
                radius:  circle_radius,
                className: "value",
                id: d["대여소번호"].toString(),
            })
            .bindTooltip("[" + d["대여소번호"] + "] " + d["보관소(대여소)명"] + "(값: "+temp_val+")", {
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
                    selectedStationNum = event.target.options.id;
                    // TODO: 선택한 station_num 에 해당하는 chart 지도 밑에 생성
                    updateLineBarChart();
                    event.target.setStyle({
                        color: "green",
                        fillColor: "green",
                        weight: 3,
                    });
                }
            });
    });
}



function updateBySlider(mode, slider_value) {

    let min_thresh = slider_value[0];
    let max_thresh = slider_value[1];

    //console.log(aggregatedDataForMap);

    mymap.eachLayer(function(layer) {
        let station_num = layer.options.id;
        if (station_num == undefined || station_num == "") {
            return;
        } else {
            /*
              let numLength = station_num.length;
              if (numLength != 5) {
                  let zeros = 5 - numLength;
                  for (let i = 0; i < zeros; i++) {
                      station_num = "0".concat(station_num);
                  }
              }
              */
            let rented = 0;
            let returned = 0;
            if (aggregatedDataForMap[station_num] == undefined) {
                return;
            } else {
                rented = aggregatedDataForMap[station_num].rented;
                returned = aggregatedDataForMap[station_num].returned;
            }

            if (mode == 0) {
                let total = returned - rented;

                if (total < min_thresh || total > max_thresh) {
                    layer.setStyle({
                        fillOpacity: 0.0
                    });
                } else {
                    layer.setStyle({
                        fillOpacity: 0.8
                    });
                }
            } else if (mode == 1) {
                if (rented < min_thresh || rented > max_thresh) {
                    layer.setStyle({
                        fillOpacity: 0.0
                    });
                } else {
                    layer.setStyle({
                        fillOpacity: 0.8
                    });
                }
            } else {
                if (returned < min_thresh || returned > max_thresh) {
                    layer.setStyle({
                        fillOpacity: 0.0
                    });
                } else {
                    layer.setStyle({
                        fillOpacity: 0.8
                    });
                }
            }


        }
    });
}




function updateMode(mode) {
    if (mode == "normal") {
        mymap.eachLayer(function(layer) {
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

        mymap.eachLayer(function(layer) {
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

    mymap = L.map("map").setView([37.56, 127.00], 11);

    let mapboxurl = "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiamtzbW9vdmUxNCIsImEiOiJja2hqNzk2ODkwajBxMnNzZDRicjUzeDVnIn0.W6JG8IbwREpA3HRD0T8-7g";

    L.tileLayer(
        mapboxurl, {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 18,
            id: "mapbox/dark-v10",
            tileSize: 512,
            zoomOffset: -1,
            accessToken: "your.mapbox.access.token",
        }
    ).addTo(mymap);

    // setting map_region
    let opt = document.querySelector("#map_region");
    regions.forEach(function(d) {
        let temp = document.createElement("option");
        temp.text = d;
        temp.value = d;
        opt.add(temp);
    });

    // TODO: sync 오류 해결
    //setMap(aggregatedDataForMap, "전체", 0);
}

function updateMap(option) {
    // TODO: 선택한 지역에 따라서 지도 Viewing 위치 변경
    let mr = document.querySelector("#map_region");
    let region = mr.options[mr.selectedIndex].value;
    let mv = document.querySelector("#map_view");
    let view = mv.options[mv.selectedIndex].value;

    mymap.eachLayer(function(layer) {
        if (layer.options.className == "value") mymap.removeLayer(layer);
    });

    /*
    if (mode == "normal") {
        setMap(aggregatedDataForMap, region, view);
    } else if (mode == "flow") {
        updateMode(mode);
    }
    */

    setMap(aggregatedDataForMap, region, view);
    console.log(slider1_max, slider1_min);


}