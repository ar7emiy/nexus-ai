import React from "react";
import mermaid from "mermaid";

mermaid.initialize({
  startOnLoad: true,
  theme: "default",
  securityLevel: "loose",
  themeCSS: `
    g.node rect {
      fill: #282a36;
      stroke: #6272a4;
    } 
    g.node text {
      fill: #f8f8f2;
    }
    .node.topic rect {
      fill: #E6E6FA;
      stroke: #333;
      stroke-width: 2px;
    }
    .node.query rect {
      fill: #FFE4B5;
      stroke: #333;
      stroke-width: 1px;
    }
    .edgePath {
      stroke: #ff79c6;
      stroke-width: 1;
    }
    .edgePath.dashed {
      stroke-dasharray: 5;
    }
  `,
  flowchart: {
    curve: 'basis',
    padding: 20
  },
  fontFamily: "Fira Code"
});

export default class Mermaid extends React.Component {
  componentDidMount() {
    mermaid.contentLoaded();
  }
  render() {
    return <div className="mermaid">{this.props.chart}</div>;
  }
}