"use client"
import ThreeSixty from "react-360-view";

const basePath = "https://fastly-production.24c.in/webin/360";
export default function View360() {
  return (
    <div
      style={{
        width: "600px", // Set width of the viewer
        height: "400px", // Set height of the viewer
        margin: "0 auto", // Center the viewer horizontally
      }}
    >
      <ThreeSixty
        amount={72}
        imagePath={basePath}
        fileName="output_{index}.jpeg"
        spinReverse
      />
    </div>
  );
}
