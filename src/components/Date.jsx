import PropTypes from "prop-types";
import Template from "../template";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const Date = ({ value }) => {
  const day = value.getDate();
  const month = monthNames[value.getMonth()];
  const year = value.getFullYear();
  return <>{`${day} ${month} ${year}`}</>;
};

Date.propTypes = {
  value: PropTypes.instanceOf(global.Date).isRequired,
};

export default Date;
