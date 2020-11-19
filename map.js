//let input = document.getElementById('input')
//input.addEventListener('change', function() {
//    readXlsxFile(input.files[0]).then((rows) => {
//        console.log(rows);
//    })
//})
//


//let data = JSON.parse('data.json');

function excelExport(event) {
    excelExportCommon(event, handleExcelDataJson);
}

function excelExportCommon(event, callback) {
    var input = event.target;
    var reader = new FileReader();
    reader.onload = function() {
        var fileData = reader.result;
        var wb = XLSX.read(fileData, { type: 'binary' });
        var sheetNameList = wb.SheetNames; // 시트 이름 목록 가져오기 
        var firstSheetName = sheetNameList[1]; // 첫번째 시트명
        var firstSheet = wb.Sheets[firstSheetName]; // 첫번째 시트 

        let data_string = JSON.stringify(XLSX.utils.sheet_to_json(firstSheet));
        let data_json = JSON.parse(data_string);
        callback(data_json);
    };
    reader.readAsBinaryString(input.files[0]);
}

function handleExcelDataJson(data) {
    //=========================
    // Draw Map
    // input: 
    //      선택된 자치구, 기간에 해당하는 data
    //      json data: [{"대여소 번호", "보관소(대여소)명", "자치구", "위도", "경도", "대여량"} , {} ...]
    //=========================
    let gangnam_bike_stations = [];
    for (let i = 0; i < data.length; i++) {
        //if (data[i]['자치구'] == '강남구') {
            gangnam_bike_stations.push(data[i]);
        //}
    }

    console.log(data)

    gangnam_bike_stations.forEach(function(d) {

        var circle = L.circle([d['위도'], d['경도']],
            {color: '#f03',
            fillColor: '#f03',
            weight: 0,
            fillOpacity: 0.5,
            radius: 50,
            className: d['대여소'].toString()})
            .bindTooltip("[" + d['대여소'] + "] " + d['보관소(대여소)명'],
            {
                permanent: false,
                direction: 'right'
            })
            .addTo(mymap)
            .on('mouseover', (event) => {event.target.setStyle({
                                            weight: 3
                                         });})
            .on('mouseout', (event) => {event.target.setStyle({
                                            weight: 0
                                        });})
            .on('mouseup', (event) => {if(event.target.options.color == 'green'){
                                            event.target.setStyle({
                                                color: 'red',
                                                fillColor: 'red',
                                                weight: 0
                                            });
                                        }
                                        else{
                                            console.log(event.target.options.className);
                                            event.target.setStyle({
                                                color: 'green',
                                                fillColor: 'green',
                                                weight: 3
                                            });
                                        }
                                     });

    })



    //$("#displayExcelJson").html(JSON.stringify(XLSX.utils.sheet_to_json(sheet)));
}


let mymap = L.map('mapid').setView([37.48, 127.05], 13);


L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiamtzbW9vdmUxNCIsImEiOiJja2hqNzk2ODkwajBxMnNzZDRicjUzeDVnIn0.W6JG8IbwREpA3HRD0T8-7g', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'your.mapbox.access.token'
}).addTo(mymap);