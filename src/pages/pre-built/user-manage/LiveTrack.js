// LiveTrack.js
import React from "react";
import { Icon } from "../../../components/Component";

const LiveTrack = () => {
  return (
    <>
      <h5 className="mb-3">Live Tracking</h5>
      <div className="border rounded p-5 text-center text-soft">
        <Icon name="location" size="lg" />
        <p className="mt-2">
          Live staff tracking will appear here
        </p>
      </div>
    </>
  );
};

export default LiveTrack;
