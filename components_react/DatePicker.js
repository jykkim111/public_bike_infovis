"use strict";

const e = React.createElement;
const { makeStyles, TextField } = window["MaterialUI"];

const useStyles_datePicker = makeStyles((theme) => ({
  container: {
    display: "flex",
    flexWrap: "wrap",
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    marginTop: theme.spacing(1),
    width: 250,
  },
}));
// to do : startTime > endTime이 되지 않도록 하기
function DateAndTimePickers() {
  const classes = useStyles_datePicker();
  const onStartChanged = (event) => {
    brushed({
      selection: [
        lineChartX(Date.parse(event.target.value)),
        lineChartX(endTime),
      ],
      type: "end",
    });
  };
  const onEndChanged = (event) => {
    brushed({
      selection: [
        lineChartX(startTime),
        lineChartX(Date.parse(event.target.value)),
      ],
      type: "end",
    });
  };
  return (
    <form className={classes.container} noValidate>
      <TextField
        id="datetime-local"
        label="시작 시간"
        type="datetime-local"
        value={d3.timeFormat("%Y-%m-%dT%H:%M")(startTime)}
        onChange={onStartChanged}
        className={classes.textField}
        InputLabelProps={{
          shrink: true,
        }}
      />
      <TextField
        id="datetime-local2"
        label="종료 시간"
        type="datetime-local"
        value={d3.timeFormat("%Y-%m-%dT%H:%M")(endTime)}
        onChange={onEndChanged}
        className={classes.textField}
        InputLabelProps={{
          shrink: true,
        }}
      />
    </form>
  );
}
