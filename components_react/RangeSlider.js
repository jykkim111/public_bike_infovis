"use strict";

const e = React.createElement;
const {
  Typography,
  Slider,
  makeStyles,
  FormControlLabel,
  Switch,
  Collapse,
} = window["MaterialUI"];

const useStyles = makeStyles({
  root: {
    paddingLeft: 20,
  },
});

function valuetext(value) {
  return `${value < 12 * 60 * 60 * 1000 ? "오전" : "오후"} ${
    parseInt(value / (60 * 60 * 1000)) % 12 > 0
      ? parseInt(value / (60 * 60 * 1000)) % 12
      : 12
  }시`;
}

function RangeSlider() {
  const classes = useStyles();
  const [value, setValue] = React.useState([0, 24 * 60 * 60 * 1000]);
  const [state, setState] = React.useState(false);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    onSliderChanged(newValue);
  };

  const handleStateChange = (event) => {
    setState(event.target.checked);
    sliderModeChange(event.target.checked);
  };

  return (
    <div style={{ display: "flex", flexDirection: "row", minHeight: 70 }}>
      <FormControlLabel
        control={
          <Switch
            checked={state}
            onChange={handleStateChange}
            name="checked"
            color="primary"
          />
        }
        label="시간대 필터"
      />
      <Collapse in={state}>
        <div style={{ paddingLeft: 20 }}>
          <Typography id="range-slider" gutterBottom>
            {`시간 범위 ` +
              (state ? `(${value.map((v) => valuetext(v)).join("~")})` : "")}
          </Typography>
          <Slider
            value={value}
            onChange={handleChange}
            onChangeCommitted={(e, v) => onSliderChangeCommitted(v)}
            aria-labelledby="range-slider"
            getAriaValueText={valuetext}
            max={24 * 60 * 60 * 1000}
            step={60 * 60 * 1000}
            disabled={!state}
          />
        </div>
      </Collapse>
    </div>
  );
}

const domContainer = document.querySelector("#RangeSlider");
ReactDOM.render(e(RangeSlider), domContainer);
