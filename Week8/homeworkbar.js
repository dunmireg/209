var margin = {top: 20, right: 20, bottom: 40, left: 40},
    width = 1400 - margin.left - margin.right,
    height = 550 - margin.top - margin.bottom;
var parseDate = d3.time.format("%Y-%m-%d").parse;

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .3);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
	  .ticks(d3.time.days, 1)
    .tickFormat(d3.time.format('%a %d'));

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")

var tip = d3.tip()
	.attr('class', 'd3-tip')
	.offset([-10, 0])
	.html(function(d) {
		return "<strong>Steps:</strong> <span style='color:lightblue'>" + d.steps + "</span>";
	})

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.call(tip);

d3.tsv("data.tsv", type, function(error, data) {
  if (error) throw error;

  x.domain(data.map(function(d) { return d.date; }));
  y.domain([0, d3.max(data, function(d) { return d.steps; })]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .append("text")
      .attr("dy", ".71em")
      .attr("x", 700)
      .attr("y", 30)
      .style("text-anchor", "middle")
      .text("Date");

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Steps Taken");
  svg.selectAll(".bar")
      .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.date); })
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.steps); })
      .attr("height", function(d) { return height - y(d.steps); })
	  .on('mouseover', tip.show)
      .on('mouseout', tip.hide);

  d3.select("#sortAsc").on("click", sortBarsAsc);
  d3.select("#reset").on("click", reset);

  function sortBarsAsc() {
    var x0 = x.domain(data.sort(function(a, b) { return a.steps - b.steps; })
	  .map(function(d) { return d.date; }))
	  .copy();
    svg.selectAll(".bar")
	  .sort(function(a, b) { return x0(a.date) - x0(b.date); });
    var transition = svg.transition().duration(750),
  	  delay = function(d, i) { return i * 50; };
    transition.selectAll(".bar")
	  .delay(delay)
	  .attr("x", function(d) { return x0(d.date); });
    transition.select(".x.axis")
	  .call(xAxis)
    .selectAll("g")
	  .delay(delay);
  }

  function reset() {
    var x0 = x.domain(data.sort(function(a, b) { return d3.ascending(a.date, b.date); })
	  .map(function(d) { return d.date; }))
	  .copy();
    svg.selectAll(".bar")
	  .sort(function(a, b) { return x0(a.date) - x0(b.date); });
    var transition = svg.transition().duration(750),
  	  delay = function(d, i) { return i * 50; };
    transition.selectAll(".bar")
	  .delay(delay)
	  .attr("x", function(d) { return x0(d.date); });
    transition.select(".x.axis")
	  .call(xAxis)
    .selectAll("g")
	  .delay(delay);
  }
});
function type(d) {
  d.date = parseDate(d.date);
  d.steps = +d.steps;
  return d;
}
