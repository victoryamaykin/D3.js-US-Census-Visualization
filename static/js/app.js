// The code for the chart is wrapped inside a function that
// automatically resizes the chart
function makeResponsive() {

    // if the SVG area isn't empty when the browser loads,
    // remove it and replace it with a resized version of the chart
    var svgArea = d3.select("body").select("svg");
  
    // clear svg is not empty
    if (!svgArea.empty()) {
      svgArea.remove();
    }

    // Define SVG area dimensions
    var svgWidth = 1200;
    var svgHeight = svgWidth - svgWidth / 2.1;

    // Define the chart's margins as an object
    var chartMargin = {
    top: 40,
    right: 80,
    bottom: 80,
    left: 100
    };

    // Define dimensions of the chart area
    var chartWidth = svgWidth - chartMargin.left - chartMargin.right;
    var chartHeight = svgHeight - chartMargin.top - chartMargin.bottom;
    
    var svgArea = d3
            .select(".chart")
            .append("svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight)
            .attr("class", "chart");

    // Append an SVG group
    var chartGroup = svgArea.append("g")
    .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);

    // Initial Params
    var chosenXAxis = "poverty";

    // function used for updating x-scale var upon click on axis label
    function xScale(censusData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.9,
        d3.max(censusData, d => d[chosenXAxis]) * 1.1
        ])
        .range([0, chartWidth]);

    return xLinearScale;

    }

    // function used for updating xAxis var upon click on axis label
    function renderAxes(newXScale, xAxis) {
        var bottomAxis = d3.axisBottom(newXScale);

        xAxis.transition()
            .duration(1000)
            .call(bottomAxis);

        return xAxis;
        }

    // function used for updating circles group with a transition to
    // new circles
    function renderCircles(circlesGroup, newXScale, chosenXaxis) {

    circlesGroup.select(".x-axis")
        .transition()
        .duration(300)
        .attr("cx", d => newXScale(d[chosenXAxis]))

    return circlesGroup;
    }

    // function used for updating circles group with new tooltip
    function updateToolTip(chosenXAxis, circlesGroup) {

    if (chosenXAxis === "poverty") {
        var label = "In Poverty %";
    }
    else if (chosenXAxis === "age") {
        var label = "Age Median";
    }
    else {
        var label = "Household Income Median";
    }

    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-12, 0])
        .html(function(d) {
        return (`${d.state}<br>${label} ${d[chosenXAxis]}<br>Obestiy (%): ${d.obesity}`);
        });

    circlesGroup.call(toolTip);

    circlesGroup
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d.obesity))
    .attr("r", 16)
    .classed("stateCircle", true)
    .append("text")
            .text( function (d) { return   d.abbr  ; })
            .attr("dx", d => xLinearScale(d[chosenXAxis]))
            .attr("dy", d => yLinearScale(d.obesity))
            .classed("stateText", true)
            .attr("font-size", 14)
    // Hover rules
    .on("mouseover", function(d) {
      // Show the tooltip
      toolTip.show(d, this);
      // Highlight the state circle's border
      d3.select(this).style("stroke", "#323232");
    })
    .on("mouseout", function(d) {
      // Remove the tooltip
      toolTip.hide(d);
      // Remove highlight
      d3.select(this).style("stroke", "#e3e3e3");
    });
    }
    
    
    // Retrieve data from the CSV file and execute everything below
    
    d3.csv("data/data.csv").then(function(censusData) {
    
        // parse data
        censusData.forEach(function(d) {
            d.age = +d.age;
            d.poverty = +d.poverty;
            d.obesity = +d.obesity;
            d.income = +d.income;
        });
    

        // xLinearScale function above csv import
        var xLinearScale = xScale(censusData, chosenXAxis);

        // Create y scale function
        var yLinearScale = d3.scaleLinear()
            .domain([d3.min(censusData, d => d.obesity) - 1, d3.max(censusData, d => d.obesity)])
            .range([chartHeight, 0]);

        // Create initial axis functions
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        // append x axis
        var xAxis = chartGroup.append("g")
            .classed("x-axis", true)
            .attr("transform", `translate(0, ${chartHeight})`)
            .call(bottomAxis);

        // append y axis
        chartGroup.append("g")
            .call(leftAxis);

        // append initial circles
        var circlesGroup = chartGroup.selectAll("circle")
            .data(censusData)
            .enter()
            
        circlesGroup
            .append("circle")
            .attr("cx", d => xLinearScale(d[chosenXAxis]))
            .attr("cy", d => yLinearScale(d.obesity))
            .attr("r", 16)
            .classed("stateCircle", true)

        circlesGroup
            .append("text")
            .text( function (d) { return   d.abbr  ; })
            .attr("dx", d => xLinearScale(d[chosenXAxis]))
            .attr("dy", d => yLinearScale(d.obesity))
            .classed("stateText", true)
            .attr("font-size", 14)

        // Create group for  2 x- axis labels
        var labelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);

        var povertyLabel = labelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "poverty") // value to grab for event listener
            .classed("active", true)
            .text("In Poverty (%)");

        // var ageLabel = labelsGroup.append("text")
        //     .attr("x", 0)
        //     .attr("y", 40)
        //     .attr("value", "age") // value to grab for event listener
        //     .classed("inactive", true)
        //     .text("Age (Median)");

        // var incomeLabel = labelsGroup.append("text")
        //     .attr("x", 0)
        //     .attr("y", 60)
        //     .attr("value", "income") // value to grab for event listener
        //     .classed("inactive", true)
        //     .text("Household Income (Median)");

        // append y axis
        chartGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - (chartHeight / 10))
            .attr("x", 0 - (chartMargin.top / 0.15))
            .attr("dy", "1em")
            .classed("axis-text", true)
            .text("Obesity (%)");

        // updateToolTip function above csv import
        var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        // x axis labels event listener
        labelsGroup.selectAll("text")
            .on("click", function() {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {

                // replaces chosenXAxis with value
                chosenXAxis = value;

                console.log(chosenXAxis)

                // updates x scale for new data
                xLinearScale = xScale(censusData, chosenXAxis);

                // updates x axis with transition
                xAxis = renderAxes(xLinearScale, xAxis);

                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

                // changes classes to change bold text
                if (chosenXAxis === "age") {
                ageLabel
                    .classed("active", true)
                    .classed("inactive", false);
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
                }
                else if (chosenXAxis === "income") {
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                incomeLabel
                    .classed("active", true)
                    .classed("inactive", false);
                }
                else {
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                povertyLabel
                    .classed("active", true)
                    .classed("inactive", false);
                incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
        }
        });
    });

        
    }

// When the browser loads, makeResponsive() is called.
makeResponsive();

// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);

function minNavBar() {
    var x = document.getElementById("myTopnav");
    if (x.className === "topnav") {
      x.className += " responsive";
    } else {
      x.className = "topnav";
    }
  }

  