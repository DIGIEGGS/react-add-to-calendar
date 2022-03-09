import React from "react";
import { AddToCalendar } from "../components";

const App: React.FC = () => {
  const event = {
    title: "Sample Event",
    description: "This is the sample event provided as an example only",
    location: "Portland, OR",
    startTime: "2016-09-16T20:15:00-04:00",
    endTime: "2016-09-16T21:45:00-04:00"
  };
  return <AddToCalendar event={event} />;
};

export default App;
