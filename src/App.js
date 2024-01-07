import "./App.css";
import {
  CosmographProvider,
  Cosmograph,
  CosmographHistogram,
} from "@cosmograph/react";
import { useState } from "react";
import nodes from "./node_list.json";
import edges from "./edge_list.json";

const Legend = ({ colormap }) => (
  <div style={{ position: "fixed", top: 0, left: "2vw" }}>
    {Object.entries(colormap).map(([country, color], index) => (
      <div key={index}>
        <div
          style={{
            display: "inline-block",
            backgroundColor: color,
            width: "0.75rem",
            height: "0.75rem",
            borderRadius: "9999px",
          }}
        />
        <div
          style={{
            display: "inline-block",
            marginLeft: "1rem",
            color: "white",
            fontSize: "0.75rem",
          }}
        >
          {country}
        </div>
      </div>
    ))}
  </div>
);

const Tooltip = ({ content, position, onClose }) => {
  const style = {
    position: "absolute",
    top: position.y,
    left: position.x,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: "1rem",
    borderRadius: "0.5rem",
    boxShadow: "0 0 5px #999",
    width: "500px",
  };

  return (
    <div
      className="bg-white p-4 border border-gray-200 shadow-lg rounded text-sm text-gray-700"
      style={style}
    >
      <div dangerouslySetInnerHTML={{ __html: content }} />
      <button
        onClick={onClose}
        style={{ cursor: "pointer", padding: "5px", marginTop: "10px" }}
      >
        Close
      </button>
    </div>
  );
};

function App() {
  const colormap = nodes.reduce((map, node) => {
    if (node.color !== "#d3d3d3") {
      map[node.first_author_country] = node.color;
    }
    return map;
  }, {});
  console.log(colormap);

  const [tooltipProps, setTooltipProps] = useState({
    visible: false,
    content: null,
    position: { x: 0, y: 0 },
  });

  const handleNodeClick = (d, i, position, event) => {
    event.preventDefault();
    if (!d) {
      setTooltipProps({ ...tooltipProps, visible: false });
      return;
    }

    const properties = {
      Title: d.title,
      doi: `<a href=${d.doi}>${d.doi}</a>`,
      "Publication Date": d.publication_date,
      "Author Country": d.first_author_country,
      "Author Institution": d.first_author_institution,
      Author: d.first_author_name,
      "Incoming Links": d.cited_by_count,
      "Outgoing Links": d.outgoing_links,
    };

    const tooltipContent = Object.entries(properties)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => `<strong>${key}:</strong> ${value}<br>`)
      .join("");

    setTooltipProps({
      content: tooltipContent,
      visible: true,
      position: { x: event.pageX + 10, y: event.pageY + 10 },
    });
  };
  const calculateNodeSize = (d) => {
    const maxSize = 20;
    const minSize = 5;
    return d.incoming_links > maxSize
      ? d.incoming_links / 100
      : Math.max(d.incoming_links, minSize);
  };

  return (
    <div className="App">
      <CosmographProvider nodes={nodes} links={edges}>
        <Cosmograph
          style={{ width: "100vw", height: "100vh" }}
          nodeColor={(d) => d.color + "90"}
          nodeLabelAccessor={(d) => d.title && d.title.slice(0, 20) + "..."}
          nodeSize={calculateNodeSize}
          linkWidth={(d) => d.cited_by_count}
          linkWidthScale={2}
          linkColor="rgba(255, 255, 255, 0.05)"
          curvedLinks={true}
          spaceSize={8192}
          simulationLinkSpring={0.1}
          simulationRepulsion={1}
          linkDistance={10}
          simulationCenter={0.7}
          useQuadtree={true}
          simulationGravity={0.3}
          onClick={(d, i, position, event) =>
            handleNodeClick(d, i, position, event)
          }
        ></Cosmograph>
        <CosmographHistogram
          style={{
            width: 600,
            height: 200,
            position: "absolute",
            top: 0,
            right: 0,
          }}
          accessor={(d) => d.cited_by_count}
        />
        <Legend colormap={colormap} />
      </CosmographProvider>
      {tooltipProps.visible && (
        <Tooltip
          content={tooltipProps.content}
          position={tooltipProps.position}
          onClose={() => setTooltipProps({ ...tooltipProps, visible: false })}
        />
      )}
    </div>
  );
}

export default App;
