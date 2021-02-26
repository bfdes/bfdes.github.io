import * as React from "react";

type Props = {
  value: Date;
};

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

const Date: React.FC<Props> = ({ value }: Props) => {
  const day = value.getDate();
  const month = monthNames[value.getMonth()];
  const year = value.getFullYear();
  return <>{`${day} ${month} ${year}`}</>;
};

export default Date;
