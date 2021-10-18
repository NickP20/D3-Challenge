var svgWidth = 960;
var svgHeight = 660;

var margin = {
  top: 20,
  right: 40,
  bottom: 100,
  left: 80
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(censusData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.8,
      d3.max(censusData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);
  return xLinearScale;
}

// function used for updating y-scale var upon click on axis label
function yScale(censusData, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenYAxis]) * 0.8,
      d3.max(censusData, d => d[chosenYAxis]) * 1.2
    ])
    .range([height, 0]);
  return yLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderXAxis(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);
  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);
  return xAxis;
}

// function used for updating yAxis var upon click on axis label
function renderYAxis(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);
  yAxis.transition()
    .duration(1000)
    .call(leftAxis);
  return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));
  return circlesGroup;
}

// function used for updating labels with transition
function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    textGroup.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis]))
      .attr("y", d => newYScale(d[chosenYAxis]));
    return textGroup;
  }

  function styleX(value, chosenXAxis){
      switch (chosenXAxis){
          case "poverty":
              return `${value}%`;
          case "income":
              return `${value}`;
          default:
              return `${value}`;
      }
  }

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
  var xLabel;
  var yLabel;
  if (chosenXAxis === "poverty") {
    xLabel = "Poverty:";
  }
  else if (chosenXAxis === "income") {
    xLabel = "Median Income:";
  }
  else {
    xLabel = "Age";
  }
  if (chosenYAxis === "healthcare") {
    yLabel = "Lacks Healthcare:";
  }
  else if (chosenYAxis === "obesity") {
    yLabel = "Obesity:";
  }
  else {
    yLabel = "Smokers:";
  }

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-10, 5])
    .html(function(d) {
      return (`${d.state}<br>${xLabel} ${styleX(d[chosenXAxis], chosenXAxis)}<br>${yLabel} ${d[chosenYAxis]}%`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", toolTip.show)
    // onmouseout event
    .on("mouseout", toolTip.hide);
  
    return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(censusData, err) {
  if (err) throw err;

  // parse data
  censusData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.healthcare = +data.healthcare;
    data.income = +data.income;
    data.obesity = +data.obesity;
    data.smokes = +data.smokes;
    data.age = +data.age;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(censusData, chosenXAxis);
  // yLinearScale function above csv import
  var yLinearScale = yScale(censusData, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(censusData)
    .enter()
    .append("circle")
    .classed("stateCircle", true)
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 12)
    .attr("opacity", ".8");

// append labels
  var textGroup = chartGroup.selectAll(".stateText")
    .data(censusData)
    .enter()
    .append("text")
    .classed("stateText", true)
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]))
    .attr("dy", 5)
    .attr("font-size", 10)
    .text(d => d.abbr);

  // Create group for x-axis labels
  var xLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + margin.top})`);

  var povertyLabel = xLabelsGroup.append("text")
    .classed("aText", true)
    .classed("active", true)
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .text("In Poverty (%)");

  var ageLabel = xLabelsGroup.append("text")
    .classed("aText", true)
    .classed("inactive", true)
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .text("Age (Median)");

    var incomeLabel = xLabelsGroup.append("text")
    .classed("aText", true)
    .classed("inactive", true)
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .text("Household Income (Median)");

  // Create group for y-axis labels
  var yLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${0 -margin.left/4}, ${height/2})`);

  var healthCareLabel = yLabelsGroup.append("text")
    .classed("aText", true)
    .classed("active", true)
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - 20)
    .attr("x", 0)
    .attr("value", "healthcare") // value to grab for event listener
    .text("Lacks Healthcare (%)");

  var smokesLabel = yLabelsGroup.append("text")
    .classed("aText", true)
    .classed("inactive", true)
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - 40)
    .attr("x", 0)
    .attr("value", "smokes") // value to grab for event listener
    .text("Smoker (%)");

    var obesityLabel = yLabelsGroup.append("text")
    .classed("aText", true)
    .classed("inactive", true)
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - 60)
    .attr("x", 0)
    .attr("value", "obesity") // value to grab for event listener
    .text("Obese (%)");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // x axis labels event listener
  xLabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {
        // replaces chosenXAxis with value
        chosenXAxis = value;
        // console.log(chosenXAxis)
        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(censusData, chosenXAxis);
        // updates x axis with transition
        xAxis = renderXAxis(xLinearScale, xAxis);
        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis,
            yLinearScale, chosenYAxis);
        // updates text
        textGroup = renderText(textGroup, xLinearScale, chosenXAxis, 
            yLinearScale, chosenYAxis);
        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false)
          incomeLabel
            .classed("active", false)
            .classed("inactive", true)
          ageLabel
            .classed("active", false)
            .classed("inactive", true)
        }
        else if (chosenXAxis === "income"){
          povertyLabel
            .classed("active", false)
            .classed("inactive", true)
          incomeLabel
            .classed("active", true)
            .classed("inactive", false)
          ageLabel
            .classed("active", false)
            .classed("inactive", true)
        }
        else {
            povertyLabel
              .classed("active", false)
              .classed("inactive", true)
            incomeLabel
              .classed("active", false)
              .classed("inactive", true)
            ageLabel
              .classed("active", true)
              .classed("inactive", false)
          }
      }
    });

// Y axis labels event listener
    yLabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {
        // replaces chosenXAxis with value
        chosenYAxis = value;
        // console.log(chosenXAxis)
        // functions here found above csv import
        // updates x scale for new data
        yLinearScale = yScale(censusData, chosenYAxis);
        // updates x axis with transition
        yAxis = renderYAxis(yLinearScale, yAxis);
        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis,
            yLinearScale, chosenYAxis);
        // updates text
        textGroup = renderText(textGroup, xLinearScale, chosenXAxis,
            yLinearScale, chosenYAxis);
        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenYAxis, chosenXAxis , circlesGroup);
        // changes classes to change bold text
        if (chosenYAxis === "healthcare") {
            healthCareLabel
              .classed("active", true)
              .classed("inactive", false)
            smokesLabel
              .classed("active", false)
              .classed("inactive", true)
            obesityLabel
              .classed("active", false)
              .classed("inactive", true)
          }
          else if (chosenYAxis === "smokes") {
            healthCareLabel
              .classed("active", false)
              .classed("inactive", true)
            smokesLabel
              .classed("active", true)
              .classed("inactive", false)
            obesityLabel
              .classed("active", false)
              .classed("inactive", true)
          }
          else {
            healthCareLabel
              .classed("active", false)
              .classed("inactive", true)
            smokesLabel
              .classed("active", false)
              .classed("inactive", true)
            obesityLabel
              .classed("active", true)
              .classed("inactive", false)
            }
      }
    });
}).catch(function(error) {
  console.log(error);
});
