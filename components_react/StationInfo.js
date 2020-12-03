"use strict";

const e = React.createElement;
const { Typography } = window["MaterialUI"];

const useStyles3 = makeStyles({
  root: {
    width: 420,
  },
});

function valuetext(value) {
  return `${value < 12 * 60 * 60 * 1000 ? "오전" : "오후"} ${
    parseInt(value / (60 * 60 * 1000)) % 12 > 0
      ? parseInt(value / (60 * 60 * 1000)) % 12
      : 12
  }시`;
}

function StationInfo() {
  const classes = useStyles3();
  const stationData = getStationData();

  return (
    <div className={classes.root}>
      <Typography>{`대여소 번호: ${selectedStationNum}`}</Typography>
      <Typography>{`대여소 이름: ${stationData.name}`}</Typography>
      <Typography>{`대여소 주소: ${stationData.address}`}</Typography>
      <Typography>{`총 대여 대수: ${stationData.rented}`}</Typography>
      <Typography>{`총 반납 대수: ${stationData.returned}`}</Typography>
      <Typography>{`합: ${stationData.total}`}</Typography>
      <Typography>{`시간 단위: ${stationData.timeUnit}`}</Typography>
    </div>
  );
}
