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
        callback(firstSheet);
    };
    reader.readAsBinaryString(input.files[0]);
}

function handleExcelDataJson(sheet) {
    let data_string = JSON.stringify(XLSX.utils.sheet_to_json(sheet));
    let data_json = JSON.parse(data_string);

    let gangnam_bike_stations = [];
    for (let i = 0; i < data_json.length; i++) {
        if (data_json[i]['자치구'] == '강남구') {
            gangnam_bike_stations.push(data_json[i]);
        }
    }

    gangnam_bike_stations.forEach(function(d) {
        var marker = L.marker([d['위도'], d['경도']]).addTo(mymap);
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