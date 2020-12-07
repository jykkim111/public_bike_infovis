//setSlider(0, 0, 50) // TODO: delete this
// TODO: delete this

slider_color = [
    [224, 58, 60],
    [255, 230, 255],
    [0, 157, 220]
]
slider_color_all = [
    [255, 255, 255],
    [143, 141, 141]
]

let slider = document.getElementById('slider');


function setSlider(slider_mode, min_val, max_val) {
    //===============================
    // int slider_mode: 0: 총 이용량 1: diff
    // int min_val: 대여량, 반납량 합쳐서 min 값 (mode 1에서는 필요x)
    // int max_val: 대여량, 반납량 합쳐서 max 값
    //===============================

    if (slider_mode == 1) {
        if (slider.noUiSlider != undefined) {
            slider.noUiSlider.destroy();
        }

        noUiSlider.create(slider, {
            start: [-max_val, max_val],
            behaviour: 'drag-tap',
            connect: true,
            tooltips: true,
            format: {
                from: function(value) {
                    return (parseInt(value));
                },
                to: function(value) {
                    return (parseInt(value));
                }
            },
            range: {
                'min': -max_val,
                'max': max_val
            },
            pips: {
                mode: 'positions',
                values: [0, 25, 50, 75, 100],
                density: 25
            },
        });

        let background_class = document.getElementsByClassName('noUi-base');
        for (let i = 0; i < background_class.length; i++) {
            background_class[i].style.background = "linear-gradient(90deg, rgba(" + slider_color[0][0] + "," + slider_color[0][1] + "," + slider_color[0][2] + ",1)," +
                "rgba(" + slider_color[1][0] + "," + slider_color[1][1] + "," + slider_color[1][2] + ",1)," +
                "rgba(" + slider_color[2][0] + "," + slider_color[2][1] + "," + slider_color[2][2] + ",1))";
        }

        slider.noUiSlider.on('change', function(values, _, _, _, positions) {
            console.log("slider: ", values); // TODO: slider 값에 따라 지도 view update 범위 list 형태로 나옴 [min, max]
            updateBySlider(1, values);
        });
    } else if (slider_mode == 0) {

        if (slider.noUiSlider != undefined) {
            slider.noUiSlider.destroy();
        }

        noUiSlider.create(slider, {
            start: [min_val, max_val],
            behaviour: 'drag-tap',
            connect: true,
            tooltips: true,
            format: {
                from: function(value) {
                    return (parseInt(value));
                },
                to: function(value) {
                    return (parseInt(value));
                }
            },
            range: {
                'min': min_val,
                'max': max_val
            },
            pips: {
                mode: 'positions',
                values: [0, 25, 50, 75, 100],
                density: 25
            },
        });

        let background_class = document.getElementsByClassName('noUi-base');
        for (let i = 0; i < background_class.length; i++) {
            background_class[i].style.background = "linear-gradient(90deg, rgba(" + slider_color_all[1][0] + "," + slider_color_all[1][1] + "," + slider_color_all[1][2] + ",1)," +
                "rgba(" + slider_color_all[0][0] + "," + slider_color_all[0][1] + "," + slider_color_all[0][2] + ",1))";
        }

        slider.noUiSlider.on('change', function(values, _, _, _, positions) {
            console.log("slider1: ", values); // TODO: slider 값에 따라 지도 view update 범위 list 형태로 나옴 [min, max]
            updateBySlider(0, values);
        });
    }
}

function updateSliderRange(min_val, max_val) {
    slider.noUiSlider.updateOptions({
        range: {
            'min': min_val,
            'max': max_val
        }
    });
}


function pickHex(color1, color2, weight) {
    var w1 = weight;
    var w2 = 1 - w1;
    var rgb = [Math.round(color1[0] * w1 + color2[0] * w2),
        Math.round(color1[1] * w1 + color2[1] * w2),
        Math.round(color1[2] * w1 + color2[2] * w2)
    ];
    return rgb;
}