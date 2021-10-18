// Define SVG area dimensions
var svgWidth = 960;
var svgHeight = 660;

// Define the chart's margins as an object
var chartMargin = {
  top: 20,
  right: 40,
  bottom: 100,
  left: 80
};

// Define dimensions of the chart area
var chartWidth = svgWidth - chartMargin.left - chartMargin.right;
var chartHeight = svgHeight - chartMargin.top - chartMargin.bottom;

// Select scatter, append SVG area to it, and set the dimensions
var svg = d3.select("#scatter")
  .append("svg")
  .attr("height", svgHeight)
  .attr("width", svgWidth);

// Append a group to the SVG area and shift ('translate') it to the right and to the bottom
var chartGroup = svg.append("g")
  .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);

// Load data from csv
d3.csv("./assets/data/data.csv").then(function(censusdata) {
    console.log(censusdata);

// parse data
//Format poverty and healthcare to numbers
    censusdata.forEach(function(data){
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
    });

//Create X and Y scale
    var xScale = d3.scaleLinear()
    .domain([d3.min(censusdata, data=> data.poverty)*.9, d3.max(censusdata, data=> data.poverty)*1.1])
    // .domain(d3.extent(censusdata, data => data.poverty))
    .range([0, chartWidth])
    // .padding(0.1);
  
    var yScale = d3.scaleLinear()
    .domain([d3.min(censusdata, data=> data.healthcare)*.9, d3.max(censusdata, data=> data.healthcare)*1.1])
    .range([chartHeight, 0]);

// Create the chart's axes
    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);

// append x axis
    chartGroup.append("g")
      .attr("transform", `translate(0, ${chartHeight})`)
      .call(xAxis);

// append y axis
    chartGroup.append("g")
      .call(yAxis);

// append initial circles
    var allCircles = chartGroup.selectAll("circle")
      .data(censusdata)
      .enter()

      allCircles
      .append("circle")
      .classed("stateCircle", true)
      .attr("cx", data => xScale(data.poverty))
      .attr("cy", data => yScale(data.healthcare))
      .attr("r", 12)
      .attr("opacity", ".8")

      allCircles.append("text")
      .classed("stateText", true)
      .attr("text-anchor", "middle")
      .attr("x", data => xScale(data.poverty))
      .attr("y", data => (yScale(data.healthcare)))
      .attr("dy", 5)
      .text((d) => d.abbr)

      chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - chartMargin.left)
        .attr("x", 0 - (chartHeight / 2))
        .attr("dy", "1em")
        .classed("aText", true)
        .text("Lacks Healthcare (%)");

        chartGroup.append("text")
        .attr("y", chartHeight + (chartMargin.bottom/2))
        .attr("x",(chartWidth / 2))
        .attr("dy", "1em")
        .classed("aText", true)
        .text("In Poverty (%)");
  }
  ).catch(function(error) {
    console.log(error);
  });