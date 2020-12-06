"use strict";

const e = React.createElement;
const { FormControlLabel, Switch } = window["MaterialUI"];

function SwitchLabels() {
  const [state, setState] = React.useState(false);

  const handleChange = (event) => {
    setState(event.target.checked);
    onSwitchChanged(event.target.checked);
  };

  return (
    <div style={{ paddingLeft: 20, display: "flex", minHeight: 70 }}>
      <FormControlLabel
        control={
          <Switch
            checked={state}
            onChange={handleChange}
            name="checked"
            color="primary"
          />
        }
        label="강수량 정보"
      />
    </div>
  );
}

const domContainer = document.querySelector("#Switch");
ReactDOM.render(e(SwitchLabels), domContainer);
