import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const InteractiveMindMap = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (data && svgRef.current) {
      const svg = d3.select(svgRef.current);
      const width = svg.node().getBoundingClientRect().width;
      const height = svg.node().getBoundingClientRect().height;

      svg.selectAll("*").remove(); // Clear previous content

      const g = svg.append("g");

      const zoom = d3.zoom()
        .scaleExtent([0.1, 4])
        .on("zoom", (event) => {
          g.attr("transform", event.transform);
        });

      svg.call(zoom);

      // Size bubbles based on number of questions
      const bubbleScale = d3.scaleSqrt()
        .domain([0, d3.max(data.topics, d => d.queries.length)])
        .range([600, 800]);

      // Create topic bubbles
      const topicSimulation = d3.forceSimulation(data.topics)
        .force("charge", d3.forceManyBody().strength(-15000))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(d => bubbleScale(d.queries.length) / 2 + 20))
        .stop();

      // Run the simulation
      for (let i = 0; i < 300; ++i) topicSimulation.tick();

      const topicNodes = g.selectAll(".topic")
        .data(data.topics)
        .enter().append("g")
        .attr("class", "topic")
        .attr("transform", d => `translate(${d.x},${d.y})`);

      topicNodes.append("circle")
        .attr("r", d => bubbleScale(d.queries.length) / 2)
        .attr("fill", "#E6E6FA")
        .attr("stroke", "#000");

      topicNodes.append("text")
        .attr("dy", d => -bubbleScale(d.queries.length) / 2 + 40)
        .attr("text-anchor", "middle")
        .attr("font-size", "24px")
        .attr("font-weight", "bold")
        .text(d => d.name);

      // Create query rectangles
      topicNodes.each(function(topicData) {
        const topic = d3.select(this);
        const queries = topicData.queries;
        const bubbleRadius = bubbleScale(queries.length) / 2;

        const querySimulation = d3.forceSimulation(queries)
          .force("charge", d3.forceManyBody().strength(-500))
          .force("center", d3.forceCenter(0, 50))
          .force("collision", d3.forceCollide().radius(60))
          .force("radius", d3.forceRadial(bubbleRadius * 0.6).strength(0.8))
          .stop();

        // Run the simulation
        for (let i = 0; i < 300; ++i) querySimulation.tick();

        const queryNodes = topic.selectAll(".query")
          .data(queries)
          .enter().append("g")
          .attr("class", "query")
          .attr("transform", d => `translate(${d.x},${d.y})`);

        queryNodes.append("rect")
          .attr("width", 140)
          .attr("height", 100)
          .attr("x", -70)
          .attr("y", -50)
          .attr("rx", 10)
          .attr("ry", 10)
          .attr("fill", "#FFE4B5")
          .attr("stroke", "#000");

        queryNodes.append("text")
          .attr("text-anchor", "middle")
          .attr("font-size", "12px")
          .attr("pointer-events", "none")
          .each(function(d) {
            const words = d.text.split(' ');
            const el = d3.select(this);
            let tspan = el.append("tspan")
              .attr("x", 0)
              .attr("dy", "-2em");
            let line = "";
            let lineCount = 0;

            words.forEach((word, i) => {
              const testLine = line + word + " ";
              if (testLine.length > 18 && lineCount < 5) {
                tspan.text(line);
                line = word + " ";
                tspan = el.append("tspan")
                  .attr("x", 0)
                  .attr("dy", "1.2em")
                  .text(word);
                lineCount++;
              } else {
                line = testLine;
              }
              if (i === words.length - 1) {
                tspan.text(line);
              }
            });
          });

        // Add tooltips for full text
        queryNodes.append("title")
          .text(d => d.text);
      });

      // Draw connections
      const allQueries = data.topics.flatMap(t => t.queries.map(q => ({...q, parentTopic: t})));
      const lineGenerator = d3.line().curve(d3.curveBasis);

      g.selectAll(".connection")
        .data(data.connections)
        .enter().append("path")
        .attr("class", "connection")
        .attr("fill", "none")
        .attr("stroke", "#999")
        .attr("stroke-width", 2)
        .attr("d", d => {
          const source = allQueries.find(q => q.id === d[0]);
          const target = allQueries.find(q => q.id === d[1]);
          if (source && target) {
            const sourcePos = {x: source.x + source.parentTopic.x, y: source.y + source.parentTopic.y};
            const targetPos = {x: target.x + target.parentTopic.x, y: target.y + target.parentTopic.y};
            const midX = (sourcePos.x + targetPos.x) / 2;
            const midY = (sourcePos.y + targetPos.y) / 2;
            return lineGenerator([
              [sourcePos.x, sourcePos.y],
              [midX, midY],
              [targetPos.x, targetPos.y]
            ]);
          }
          return null;
        });
    }
  }, [data]);

  return <svg ref={svgRef} style={{ width: '100%', height: '100%' }}></svg>;
};

export default InteractiveMindMap;