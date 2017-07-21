// Bostock's margin convention: https://gist.github.com/mbostock/3019563
var margin = {top: 20, right: 20, bottom: 70, left: 130},
    width = parseInt(d3.select("#chart").style("width")) - margin.left - margin.right,
    height = parseInt(d3.select("#chart").style("height")) - margin.top - margin.bottom;

/* Indentation pattern for method chaining:
   four spaces for methods that preserve the current selection
   two spaces for methods that change the selection. 
*/
var yScale = d3.scale.ordinal()
    .rangeRoundBands([height, 0], 10, 0.1);

var xScale = d3.scale.linear()
    .range([0, width]);

var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient("left");

var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("bottom")

var svg = d3.select("#chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");      

/* Countries and associated endangered languages figures are loaded from an external
   data file.
*/    
d3.csv("data.csv", function(error, data){
  if (error) throw error;
  
  // Strings are converted into numbers.
  data.forEach(function(d) {
     d.endangeredLanguages = +d.endangeredLanguages;
  }); 

// Bars are displayed in descending order.
data = data.sort(function(a, b) { return a["endangeredLanguages"] - b["endangeredLanguages"]; });

// Scales' input domains are defined taking into consideration the data loaded.
yScale.domain(data.map(function(d) { return d["country"]; }));
xScale.domain([0, d3.max(data, function(d) { return d["endangeredLanguages"]; })]);

svg.append("g")
    .attr("class", "y-axis")
    .call(yAxis);

svg.append("g")
    .attr("class", "x-axis")
    .call(xAxis)
    .attr("transform", "translate(0," + height + ")")
    .append("text")
  .attr("class", "label")
  .attr("transform", "translate(" + width / 2 + "," + margin.bottom / 1.5 + ")")
  .style("text-anchor", "middle")
  .text("Endangered languages");       

svg.selectAll(".bar")
    .data(data)
  .enter().append("rect")
  .attr("class", "bar")
  .attr("width", function(d) { return xScale(d["endangeredLanguages"]); })
  .attr("y", function(d) { return yScale(d["country"]); })
  .attr("fill", "#2c7bb6")
  .attr("height", yScale.rangeBand())
  .on("mouseover", function(d) {
  /* Moving the mouse over a bar causes its colour to change to red (#d7191c). 
     A tooltip with the number of endangered languages appears on the 
     aforementioned bar. */

    // Bar colour is set to red.   
    d3.select(this)
        .attr("fill", "#d7191c");

    // Tooltip position is determined using bar's coordinates.
    var xPosition = parseFloat(d3.select(this).attr("width") - 15);
    var yPosition = parseFloat(d3.select(this).attr("y"))+ yScale.rangeBand() / 2 + 5;

    // Tooltip containing number of endangered languages is created and positioned.
    svg.append("text")
       .attr("id", "tooltip")
       .attr("x", xPosition)
       .attr("y", yPosition)
       .attr("text-anchor", "middle")
       .attr("fill", "white")
       .text(d["endangeredLanguages"]);  
  })
  .on("mouseout", function(d) {
  /* On a mouseout event the bar's original colour is restored and the tooltip removed.
     A 250-ms transition makes the colour change smooth. */

    d3.select(this)
        .transition()
        .duration(250)
        .attr("fill", "#2c7bb6");
    d3.select("#tooltip").remove();
  });
});

// Responsive behaviour is implemented via resize function.
function resize() {
  var width = parseInt(d3.select("#chart").style("width")) - margin.left - margin.right,
      height = parseInt(d3.select("#chart").style("height")) - margin.top - margin.bottom;

  // Scales are updated according to the new width and height values.
  xScale.range([0, width]);
  yScale.rangeRoundBands([height, 0], 0.1);

  // Label and axes are updated.
  svg.select(".x-axis")
    .call(xAxis)
    .attr("transform", "translate(0," + height + ")")
    .select(".label")
      .attr("transform", "translate(" + width / 2 + "," + margin.bottom / 1.5 + ")");

  svg.select(".y-axis")
    .call(yAxis);

  // Tick marks are updated using the new width value.
  xAxis.ticks(Math.max(width/75, 2), "");

  // Bars' widths and heights are updated.
  svg.selectAll(".bar")
    .attr("width", function(d) { return xScale(d["endangeredLanguages"]); })
    .attr("y", function(d) { return yScale(d["country"]); })
    .attr("height", yScale.rangeBand());
}; 

// The resize function deals with resize events.
d3.select(window).on('resize', resize);

resize();