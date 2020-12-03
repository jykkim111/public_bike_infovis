//setSlider(0, 0, 50) // TODO: delete this
// TODO: delete this

slider_color = [
    [224, 58, 60],
    [255, 230, 255],
    [0, 157, 220]
]
slider_1_color = [
    [244, 188, 189],
    [224, 58, 60]
]
slider_2_color = [
    [158, 218, 242],
    [0, 157, 220]
]


let slider_1 = document.getElementById('slider_1');
let slider_2 = document.getElementById('slider_2');


function setSlider(slider_mode, min_val, max_val) {
    //===============================
    // int slider_mode: 0: all, 1: diff
    // int min_val: 대여량, 반납량 합쳐서 min 값 (mode 1에서는 필요x)
    // int max_val: 대여량, 반납량 합쳐서 max 값
    //===============================

    if (slider_mode == 1) {

        if (slider_1.noUiSlider != undefined) {
            slider_1.noUiSlider.destroy();
        }

        if (slider_2.noUiSlider != undefined) {
            slider_2.noUiSlider.destroy();
        }

        noUiSlider.create(slider_1, {
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

        slider_1.noUiSlider.on('change', function(values, _, _, _, positions) {
            console.log("slider: ", values); // TODO: slider 값에 따라 지도 view update 범위 list 형태로 나옴 [min, max]
            updateBySlider(0, values);
        });
    } else if (slider_mode == 0) {

        if (slider_1.noUiSlider != undefined) {
            slider_1.noUiSlider.destroy();
        }

        if (slider_2.noUiSlider != undefined) {
            slider_2.noUiSlider.destroy();
        }

        noUiSlider.create(slider_1, {
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
            direction: 'rtl',
            pips: {
                mode: 'positions',
                values: [0, 25, 50, 75, 100],
                density: 25
            },
        });

        slider_1.noUiSlider.on('change', function(values, _, _, _, positions) {
            console.log("slider1: ", values); // TODO: slider 값에 따라 지도 view update 범위 list 형태로 나옴 [min, max]
            updateBySlider(1, values);
        });

        noUiSlider.create(slider_2, {
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

        slider_2.noUiSlider.on('change', function(values, _, _, _, positions) {
            console.log("slider2: ", values); // TODO: slider 값에 따라 지도 view update 범위 list 형태로 나옴 [min, max]
            updateBySlider(2, values);
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