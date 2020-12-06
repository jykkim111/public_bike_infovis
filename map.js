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
            station_data[i]["rented"] = 0;
            station_data[i]["returned"] = 0;

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

            let temp_diff = Math.abs(station_data[i]["returned"] - station_data[i]["rented"]);
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

    let total_max = max_rent + max_return;
    let total_min = min_rent + min_return;

    // circle size = [radius_interval, (radius_interval + 1) * binning]
    let radius_interval = 10;
    let binning = 100;

    if (view == 0) {
        setSlider(0, total_min, total_max);
    } else if (view == 1) {
        setSlider(1, 0, max_diff);
    }


    gangnam_bike_stations.forEach(function(d) {
        let circle_radius;
        let circle_color;
        let temp_val;

        if (view == 1) { // diff
            temp_val = d["returned"] - d["rented"];

            if (temp_val >= 0) {
                circle_color = pickHex(slider_color[2], slider_color[1], Math.abs(temp_val) / max_diff);
            } else {
                circle_color = pickHex(slider_color[0], slider_color[1], Math.abs(temp_val) / max_diff);
            }

            circle_radius = ((Math.abs(temp_val) - min_diff) / Math.max(2, (max_diff - min_diff) / binning) + 1) * radius_interval;
        } else if (view == 0) { // all
            temp_val = d["rented"] + d["returned"];
            circle_color = pickHex(slider_color_all[1], slider_color_all[0], Math.abs(temp_val) / total_max);
            circle_radius = ((temp_val - total_min) / Math.max(2, (total_max - total_min) / binning) + 1) * radius_interval
        }
        let circle = L.circle([d["위도"], d["경도"]], {
                color: d3.rgb(circle_color[0], circle_color[1], circle_color[2]),
                fillColor: d3.rgb(circle_color[0], circle_color[1], circle_color[2]),
                weight: 0,
                fillOpacity: 0.8,
                radius: circle_radius,
                className: "value",
                id: d["대여소번호"].toString(),
                name: d["보관소(대여소)명"],
                value: temp_val
            })
            .bindTooltip("[" + d["대여소번호"] + "] " + d["보관소(대여소)명"] + "(값: " + temp_val + ")", {
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
                    /*
                      event.target.setStyle({
                          color: d3.rgb(circle_color[0], circle_color[1], circle_color[2]),
                          fillColor: d3.rgb(circle_color[0], circle_color[1], circle_color[2]),
                          weight: 0,
                      });
                      */
                    event.target.setStyle({
                        color: "green",
                        fillColor: "green",
                        weight: 3,
                    });
                } else {
                    selectedStationNum = event.target.options.id;
                    if (checkForGreenCircle()) {
                        circleBackFromGreen(saved_color);
                        saved_color = [circle_color[0], circle_color[1], circle_color[2]];
                    } else {
                        saved_color = [circle_color[0], circle_color[1], circle_color[2]];
                    }
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

function checkForGreenCircle() {
    let check_for_green = false;
    mymap.eachLayer(function(layer) {
        if (layer.options.color == 'green') {
            check_for_green = true;
        }
    });
    return check_for_green;
}



function circleBackFromGreen(saved_color) {
    mymap.eachLayer(function(layer) {
        if (layer.options.color == 'green') {
            layer.setStyle({
                color: d3.rgb(saved_color[0], saved_color[1], saved_color[2]),
                fillColor: d3.rgb(saved_color[0], saved_color[1], saved_color[2])
            });
        }
    });

}



let removed_layer = [];

function updateBySlider(mode) {
    let slider_value = slider.noUiSlider.get();
    let min_thresh = slider_value[0];
    let max_thresh = slider_value[1];


    mymap.eachLayer(function(layer) {
        if (layer.options.value < min_thresh || layer.options.value > max_thresh) {

            removed_layer.push(layer);
            layer.remove();
        }
        removed_layer.forEach(function(layer) {
            if (layer.options.value >= min_thresh && layer.options.value <= max_thresh) {
                layer.addTo(mymap);
                let index = removed_layer.indexOf(layer);
                removed_layer.splice(index, 1);
            }

        });
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


let regions = {
    "전체": [37.56, 127.00],
    "종로구": [37.58, 126.98],
    "중구": [37.56, 126.99],
    "용산구": [37.53, 126.98],
    "성동구": [37.55, 127.04],
    "광진구": [37.54, 127.08],
    "동대문구": [37.58, 127.05],
    "중랑구": [37.59, 127.09],
    "성북구": [37.60, 127.02],
    "강북구": [37.63, 127.01],
    "도봉구": [37.66, 127.03],
    "노원구": [37.65, 127.07],
    "은평구": [37.61, 126.92],
    "서대문구": [37.57, 126.93],
    "마포구": [37.55, 126.90],
    "양천구": [37.52, 126.85],
    "강서구": [37.56, 126.82],
    "구로구": [37.49, 126.85],
    "금천구": [37.46, 126.90],
    "영등포구": [37.51, 126.91],
    "동작구": [37.50, 126.94],
    "관악구": [37.46, 126.94],
    "서초구": [37.47, 127.03],
    "강남구": [37.49, 127.06],
    "송파구": [37.50, 127.11],
    "강동구": [37.55, 127.14],
}

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
    Object.keys(regions).forEach(function(d) {
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
    let mv = document.querySelector("#map_view").getElementsByTagName("input");

    let view = 0;
    for (let i = 0; i < mv.length; i++) {
        if (mv[i].checked) {
            view = mv[i].value;
        }
    }

    if (region == '전체') {
        mymap.setView(regions[region], 11);
    } else {
        mymap.setView(regions[region], 12);
    }

    mymap.eachLayer(function(layer) {
        if (layer.options.className == "value") mymap.removeLayer(layer);
    });

    setMap(aggregatedDataForMap, region, view);
    removed_layer = [];

}