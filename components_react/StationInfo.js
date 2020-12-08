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
      <Typography>
        <b>{`대여소 번호: `}</b>
        {`${selectedStationNum}`}
      </Typography>
      <Typography>
        <b>{`대여소 이름: `}</b>
        {`${stationData.name}`}
      </Typography>
      <Typography>
        <b>{`대여소 주소: `}</b>
        {`${stationData.address}`}
      </Typography>
      <Typography>
        <b>{`총 대여 대수: `}</b>
        {`${stationData.rented}`}
      </Typography>
      <Typography>
        <b>{`총 반납 대수: `}</b>
        {`${stationData.returned}`}
      </Typography>
      <Typography>
        <b>{`불균형 정도`}</b>
        {`(|총 반납량 - 총 대여량|): `}
        <font
          color={
            stationData.total > 0
              ? "royalblue"
              : stationData.total == 0
              ? "black"
              : "red"
          }
        >{`${Math.abs(stationData.total)}`}</font>
      </Typography>
      <Typography>
        <b>{`시간 단위:`}</b>
        {` ${stationData.timeUnit}`}
      </Typography>
    </div>
  );
}
